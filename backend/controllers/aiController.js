const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Invoice, Product, Company, Expense, Subscription, Plan, AIUsage } = require("../models");
const { Op } = require("sequelize");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAssistant = async (req, res) => {
  const companyId = req.companyId;
  const userId = req.user.id;
  console.log(">>> Charis Assistant: Request received from Company ID:", companyId, "User ID:", userId);
  
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error(">>> Charis Error: GEMINI_API_KEY is missing in backend .env");
      return res.status(500).json({ error: "AI service is not configured on the server." });
    }

    // 1. Check Usage Limits
    const subscription = await Subscription.findOne({
      where: { company_id: companyId },
      include: [Plan]
    });

    const planName = subscription?.Plan?.plan_name || 'Free Account';
    let dailyLimit = 12; // Default for Free

    if (planName.toLowerCase().includes('premium')) {
      dailyLimit = 50;
    } else if (planName.toLowerCase().includes('enterprise')) {
      dailyLimit = 100;
    }

    const today = new Date().toISOString().split('T')[0];
    const [usage, created] = await AIUsage.findOrCreate({
      where: { user_id: userId, date: today },
      defaults: { company_id: companyId, count: 0 }
    });

    if (usage.count >= dailyLimit) {
      return res.status(403).json({ 
        error: `Daily limit reached. Your ${planName} allows ${dailyLimit} messages per day. Please upgrade for more access.` 
      });
    }

    // 2. Topic Restriction & Context Fetching
    const lowerQuestion = question.toLowerCase();
    
    // Check if the question is related to Bill Easy or general business tasks
    const businessKeywords = [
      'sale', 'invoice', 'bill', 'product', 'stock', 'inventory', 'customer', 
      'supplier', 'expense', 'profit', 'loss', 'gst', 'tax', 'report', 'business',
      'godown', 'warehouse', 'payment', 'credit', 'quotation', 'eway', 'staff',
      'attendance', 'payroll', 'total', 'how many', 'what is', 'low', 'today'
    ];
    
    const isRelated = businessKeywords.some(keyword => lowerQuestion.includes(keyword)) || 
                     lowerQuestion.length < 10; // Allow short greetings

    if (!isRelated && 
        !lowerQuestion.includes('hi') && 
        !lowerQuestion.includes('hello') && 
        !lowerQuestion.includes('charis')) {
      return res.json({ 
        answer: "I am Charis, your Bill Easy business assistant. I can only help you with questions related to your business, such as sales, stock levels, expenses, and reports. For coding or other unrelated topics, please use a general-purpose AI." 
      });
    }

    let financialContext = "";
    let inventoryContext = "";

    // 3. Conditional Context Fetching
    const isFinancialQuery = lowerQuestion.includes('profit') || lowerQuestion.includes('loss') || lowerQuestion.includes('sales') || lowerQuestion.includes('money') || lowerQuestion.includes('total');
    const isInventoryQuery = lowerQuestion.includes('stock') || lowerQuestion.includes('inventory') || lowerQuestion.includes('item') || lowerQuestion.includes('product');

    if (isFinancialQuery) {
      console.log(">>> Charis: Fetching Financial Context for relevant query...");
      try {
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);

        const [totalSalesData, todaySalesData, totalExpensesData] = await Promise.all([
          Invoice.sum('total_amount', { where: { company_id: companyId } }),
          Invoice.sum('total_amount', { where: { company_id: companyId, invoice_date: { [Op.gte]: todayStart } } }),
          Expense.sum('amount', { where: { company_id: companyId } })
        ]);

        const totalSales = parseFloat(totalSalesData || 0);
        const todaySales = parseFloat(todaySalesData || 0);
        const totalExpenses = parseFloat(totalExpensesData || 0);
        const netProfit = totalSales - totalExpenses;

        financialContext = `\n[Real-time Financial Data] Today's Sales: ${todaySales.toFixed(2)}, Total Lifetime Sales: ${totalSales.toFixed(2)}, Total Expenses: ${totalExpenses.toFixed(2)}, Estimated Net Profit: ${netProfit.toFixed(2)}.`;
      } catch (dbError) {
        console.error(">>> Charis DB Error (Financial):", dbError.message);
      }
    }

    if (isInventoryQuery) {
      console.log(">>> Charis: Fetching Inventory Context for relevant query...");
      try {
        const lowStockProducts = await Product.findAll({
          where: { 
            company_id: companyId,
            stock_quantity: { [Op.lte]: sequelize.col('low_stock_alert') }
          },
          order: [['stock_quantity', 'ASC']],
          limit: 10,
          attributes: ['name', 'stock_quantity']
        });

        if (lowStockProducts.length > 0) {
          inventoryContext = "\n[Real-time Inventory Data] Items running low: " + lowStockProducts.map(p => `${p.name} (${p.stock_quantity} left)`).join(", ");
        } else {
          // If no items are below alert level, just get current stock levels
          const topProducts = await Product.findAll({
            where: { company_id: companyId },
            limit: 5,
            attributes: ['name', 'stock_quantity']
          });
          inventoryContext = "\n[Real-time Inventory Data] Stock levels: " + topProducts.map(p => `${p.name} (${p.stock_quantity})`).join(", ");
        }
      } catch (dbError) {
        console.error(">>> Charis DB Error (Inventory):", dbError.message);
      }
    }

    const company = await Company.findByPk(companyId, { attributes: ['name'] });
    const businessName = company?.name || "the business";

    // 4. Updated Personality & System Instruction
    const systemInstruction = `You are Charis, the exclusive business assistant for ${businessName} on the Bill Easy platform. 
Rules:
- YOU ARE ONLY ALLOWED TO DISCUSS BUSINESS DATA RELATED TO BILL EASY (Sales, Stock, Invoices, Customers, Expenses, etc.).
- STRICTLY PROHIBITED: Coding, technical programming, general knowledge outside of business, or any unrelated topics.
- If the user asks about unrelated topics (like coding), politely refuse and state your purpose.
- Use the provided real-time data to answer questions about today's sales, low stock, etc.
- If the user greets you, respond politely as a business assistant.
- Be concise, professional, and use clean text (avoid triple asterisks).`;

    // 5. Prompt Construction
    const contextStr = (financialContext || inventoryContext) ? `\nContextual Data:${financialContext}${inventoryContext}` : "";
    const fullPrompt = `${systemInstruction}${contextStr}\n\nUser Question: ${question}`;

    // 6. Gemini Call with Fallback
    let text;
    // In 2026, we prioritize newer models but keep 1.5 as fallback
    const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const modelName of modelNames) {
      try {
        console.log(`>>> Charis: Attempting to call ${modelName} (v1)...`);
        // Explicitly use v1 API which is more stable for production models
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        text = response.text();
        
        if (text) {
          // Increment Usage Count on success
          await usage.increment('count');
          break; // Success!
        }
      } catch (apiError) {
        console.error(`>>> Charis API Error with ${modelName}:`, apiError.message);
        lastError = apiError;
        
        // If it's a 404, we immediately try the next one
        if (apiError.message.includes('404')) continue;
        
        // For other errors (like rate limits), we still try the next model
        continue;
      }
    }

    if (!text) {
      return res.status(200).json({ 
        answer: "I'm having a bit of trouble connecting to my brain right now. Please try asking me again in a few seconds." 
      });
    }

    console.log(">>> Charis successfully generated a response. New usage count:", usage.count + 1);
    res.json({ answer: text, usage: usage.count + 1, limit: dailyLimit });

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
