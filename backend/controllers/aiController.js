const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Invoice, Product, Company, Expense } = require("../models");
const { Op } = require("sequelize");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAssistant = async (req, res) => {
  const companyId = req.companyId;
  console.log(">>> Charis Assistant: Request received from Company ID:", companyId);
  
  try {
    const { question, history = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error(">>> Charis Error: GEMINI_API_KEY is missing in backend .env");
      return res.status(500).json({ error: "AI service is not configured on the server." });
    }

    const lowerQuestion = question.toLowerCase();
    let financialContext = "";
    let inventoryContext = "";

    // 1. Conditional Context Fetching
    const isFinancialQuery = lowerQuestion.includes('profit') || lowerQuestion.includes('loss') || lowerQuestion.includes('sales') || lowerQuestion.includes('money');
    const isInventoryQuery = lowerQuestion.includes('stock') || lowerQuestion.includes('inventory');

    if (isFinancialQuery) {
      console.log(">>> Charis: Fetching Financial Context for relevant query...");
      try {
        const [totalSalesData, totalExpensesData] = await Promise.all([
          Invoice.sum('total_amount', { where: { company_id: companyId } }),
          Expense.sum('amount', { where: { company_id: companyId } })
        ]);

        const totalSales = parseFloat(totalSalesData || 0);
        const totalExpenses = parseFloat(totalExpensesData || 0);
        const netProfit = totalSales - totalExpenses;

        financialContext = `\n[Real-time Financial Data] Total Sales: ${totalSales.toFixed(2)}, Total Expenses: ${totalExpenses.toFixed(2)}, Net Profit: ${netProfit.toFixed(2)}.`;
      } catch (dbError) {
        console.error(">>> Charis DB Error (Financial):", dbError.message);
      }
    }

    if (isInventoryQuery) {
      console.log(">>> Charis: Fetching Inventory Context for relevant query...");
      try {
        const lowStockProducts = await Product.findAll({
          where: { company_id: companyId },
          order: [['stock_quantity', 'ASC']],
          limit: 5,
          attributes: ['name', 'stock_quantity']
        });

        if (lowStockProducts.length > 0) {
          inventoryContext = "\n[Real-time Inventory Data] Items running low: " + lowStockProducts.map(p => `${p.name} (${p.stock_quantity} left)`).join(", ");
        } else {
          inventoryContext = "\n[Real-time Inventory Data] No products found in inventory.";
        }
      } catch (dbError) {
        console.error(">>> Charis DB Error (Inventory):", dbError.message);
      }
    }

    const company = await Company.findByPk(companyId, { attributes: ['name'] });
    const businessName = company?.name || "the business";

    // 2. System Instruction with strict "no coding" rule
    const systemInstruction = `You are Charis, a friendly and intelligent business co-pilot for ${businessName}.

STRICT RULES:
1. NO CODING: Never provide code, scripts, terminal commands, or technical implementation details. If asked for code, politely decline and offer business advice instead.
2. NO DATABASE QUERIES: Never write SQL or database queries. Use the provided real-time data only.
3. BUSINESS FOCUS ONLY: Only answer questions related to business, billing, invoices, inventory, sales, expenses, and accounting.
4. GREETINGS: For greetings ("Hi", "Hello"), respond warmly as a business assistant. Do not force financial data into casual conversation.
5. FORMATTING: Avoid excessive markdown (***). Use clean, readable text. Bullet points only for lists.
6. ACTIONS: If asked to "create bill", "make invoice", or perform database writes, explain you are an AI and they should use the "Create Sales Invoice" button.
7. NON-BUSINESS QUERIES: For questions unrelated to business (weather, sports, general knowledge), reply: "I'm Charis, your billing assistant. I'm here to help with your business needs like invoices, inventory, and sales. How can I assist you today?"
8. Be concise, professional, and helpful.`;

    // 3. Build full prompt with system instruction and context
    const contextStr = (financialContext || inventoryContext) ? `\n[Contextual Data]:${financialContext}${inventoryContext}` : "";
    const fullPrompt = `${systemInstruction}\n\n${contextStr}\n\nUser Question: ${question}`;

    // 4. Gemini Call with fallback models
    let text;
    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    let lastError = null;
    
    for (const modelName of models) {
      try {
        console.log(`>>> Charis: Trying model ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        text = response.text();
        console.log(`>>> Charis: Success with ${modelName}`);
        break; // Success, exit loop
      } catch (err) {
        console.error(`>>> Charis: Failed with ${modelName}:`, err.message);
        lastError = err;
        continue; // Try next model
      }
    }
    
    if (!text) {
      console.error(">>> Charis: All models failed. Last error:", lastError?.message);
      return res.status(200).json({ 
        answer: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." 
      });
    }

    console.log(">>> Charis successfully generated a response.");
    res.json({ answer: text });

  } catch (error) {
    console.error(">>> Charis Assistant General Error:", error);
    res.status(500).json({ 
      error: "Charis is temporarily unavailable", 
      details: error.message 
    });
  }
};

module.exports = {
  chatWithAssistant
};
