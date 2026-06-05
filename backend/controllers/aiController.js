const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { Invoice, Product, Company, Expense, Subscription, Plan, AIUsage, Purchase, Supplier, Customer } = require("../models");
const { Op, sequelize } = require("sequelize");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// STRICT SYSTEM INSTRUCTION FOR CHARIS
const CHARIS_SYSTEM_INSTRUCTION = `You are Charis, the exclusive AI assistant for Bill Easy - a GST billing and inventory management platform.

🚫 STRICT RULES - NEVER VIOLATE:
1. ONLY discuss Bill Easy platform topics: Invoices, E-way Bills, Purchase Orders, Reports, Products, Stock, GST, Customers, Suppliers
2. NEVER answer coding questions, programming, general news, weather, sports, entertainment, or any non-business topics
3. NEVER provide code examples, scripts, or technical implementations
4. If asked about unrelated topics, politely redirect: "I'm Charis, your Bill Easy assistant. I can only help with billing, inventory, and business tasks on the Bill Easy platform."

✅ ALLOWED TOPICS:
- How to create invoices, quotations, credit notes
- How to create E-way bills and track them
- How to create Purchase Orders (PO)
- How to generate and read reports (sales, purchase, GST, stock)
- How to add/manage products and stock
- How to add customers and suppliers
- GST calculations and compliance
- How to use Bill Easy features

📋 BILL EASY FEATURES GUIDE:

1. CREATE INVOICE:
   - Go to Sales → Invoices → Create Invoice
   - Select Customer or add new
   - Add items (search existing or type new)
   - Set GST rates, quantities, prices
   - Save and print/share

2. CREATE E-WAY BILL:
   - Go to Sales → E-way Bills → Create E-way Bill
   - Fill vehicle details, distance, transport info
   - Generate and print

3. CREATE PURCHASE ORDER (PO):
   - Go to Purchase → Purchase Orders → Create PO
   - Select Supplier
   - Add items to order
   - Set expected delivery date
   - Save and send to supplier

4. VIEW REPORTS:
   - Go to Reports section
   - Available: Sales Report, Purchase Report, GST Report, Stock Report, Profit/Loss
   - Select date range and filters
   - Export to PDF/Excel

5. ADD PRODUCT:
   - Go to Products → Add Product
   - Fill: Name, HSN Code, GST Rate, Unit, Opening Stock
   - Set Low Stock Alert
   - Save

6. MANAGE STOCK:
   - View low stock alerts on dashboard
   - Go to Inventory → Stock Adjustment
   - Transfer between godowns
   - Update quantities

Always be helpful, concise, and guide users step-by-step for Bill Easy operations.`;

// Define Tools for Gemini
const charisTools = {
  functionDeclarations: [
    {
      name: "get_low_stock_products",
      description: "Get a list of products that have low stock (stock quantity is at or below the low stock alert level). Use this when the user asks about lowest stock, running out of items, or items needing reorder.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    {
      name: "search_product",
      description: "Search for a specific product by name to get its details like price, stock, HSN code, and tax rate.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          product_name: { type: SchemaType.STRING, description: "Name of the product to search for" }
        },
        required: ["product_name"]
      }
    },
    {
      name: "get_financial_summary",
      description: "Get today's total sales, overall total sales, total expenses, and net profit.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    {
      name: "get_recent_invoices",
      description: "Get a list of the 5 most recent invoices with their totals, customer names, and status.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    {
      name: "get_top_debtors",
      description: "Get a list of the top 5 customers who owe the most money (highest outstanding balance).",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    }
  ]
};

const chatWithAssistant = async (req, res) => {
  const companyId = req.companyId;
  const userId = req.user.id;
  
  try {
    const { question, pdfData, pdfType } = req.body;

    if (!question && !pdfData) {
      return res.status(400).json({ error: "Question or PDF data is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "AI service is not configured on the server." });
    }

    // 1. Check Usage Limits (Enterprise ONLY)
    const subscription = await Subscription.findOne({
      where: { company_id: companyId },
      include: [Plan]
    });

    const planName = subscription?.Plan?.plan_name || 'Free Account';

    if (!planName.toLowerCase().includes('enterprise')) {
      return res.status(403).json({ 
        error: `Charis AI Assistant is exclusive to Enterprise users. Please upgrade your plan to access this feature.` 
      });
    }
    
    const dailyLimit = 50;
    const today = new Date().toISOString().split('T')[0];
    const [usage] = await AIUsage.findOrCreate({
      where: { user_id: userId, date: today },
      defaults: { company_id: companyId, count: 0 }
    });

    if (usage.count >= dailyLimit) {
      return res.status(403).json({ 
        error: `Daily limit reached. Your Enterprise plan allows ${dailyLimit} AI questions per day.` 
      });
    }

    // 2. STRICT Topic Filtering - Block non-Bill Easy topics
    const lowerQuestion = (question || '').toLowerCase();
    const blockedTopics = [
      'code', 'coding', 'programming', 'script', 'python', 'javascript', 'java', 'c++',
      'news', 'weather', 'sports', 'cricket', 'football', 'movie', 'film', 'song',
      'recipe', 'cooking', 'travel', 'politics', 'election', 'stock market', 'crypto',
      'bitcoin', 'game', 'gaming', 'playstation', 'xbox', 'dating', 'relationship'
    ];
    
    if (blockedTopics.some(topic => lowerQuestion.includes(topic))) {
      return res.json({ 
        answer: "🚫 I'm Charis, your Bill Easy business assistant. I cannot help with coding, news, entertainment, or general topics.\n\n✅ I can help you with:\n• Creating invoices, e-way bills, purchase orders\n• Generating sales, GST, and stock reports\n• Managing products and inventory\n• Bill Easy platform features\n\nHow can I assist with your billing or inventory today?" 
      });
    }

    // 3. Setup Gemini Model with Tools
    const company = await Company.findByPk(companyId, { attributes: ['name'] });
    const businessName = company?.name || "your business";
    
    // We add business name dynamically to the system instruction
    const systemInstruction = `${CHARIS_SYSTEM_INSTRUCTION}\n\nYou are currently assisting the business named "${businessName}".\nAnswer using the provided tools when the user asks for specific data.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.0-flash",
      tools: [charisTools],
      systemInstruction: systemInstruction
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(question || 'Process the PDF data');
    let response = await result.response;

    // 4. Handle Function Calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      let functionResponseData = {};

      try {
        if (call.name === "get_low_stock_products") {
          const lowStockProducts = await Product.findAll({
            where: { company_id: companyId, stock_quantity: { [Op.lte]: sequelize.col('low_stock_alert') } },
            order: [['stock_quantity', 'ASC']],
            limit: 10,
            attributes: ['name', 'stock_quantity', 'low_stock_alert']
          });
          functionResponseData = { products: lowStockProducts };
        } 
        else if (call.name === "search_product") {
          const { product_name } = call.args;
          const products = await Product.findAll({
            where: { company_id: companyId, name: { [Op.iLike]: `%${product_name}%` } },
            limit: 5,
            attributes: ['name', 'stock_quantity', 'sale_price', 'hsn_code', 'gst_rate']
          });
          functionResponseData = { products };
        }
        else if (call.name === "get_financial_summary") {
          const todayStart = new Date();
          todayStart.setHours(0,0,0,0);
          const [totalSalesData, todaySalesData, totalExpensesData] = await Promise.all([
            Invoice.sum('total_amount', { where: { company_id: companyId } }),
            Invoice.sum('total_amount', { where: { company_id: companyId, invoice_date: { [Op.gte]: todayStart } } }),
            Expense.sum('amount', { where: { company_id: companyId } })
          ]);
          functionResponseData = {
            today_sales: parseFloat(todaySalesData || 0),
            total_sales: parseFloat(totalSalesData || 0),
            total_expenses: parseFloat(totalExpensesData || 0),
            net_profit: parseFloat(totalSalesData || 0) - parseFloat(totalExpensesData || 0)
          };
        }
        else if (call.name === "get_recent_invoices") {
          const invoices = await Invoice.findAll({
            where: { company_id: companyId },
            include: [{ model: Customer, attributes: ['name'] }],
            order: [['invoice_date', 'DESC']],
            limit: 5,
            attributes: ['invoice_number', 'total_amount', 'payment_status', 'invoice_date']
          });
          functionResponseData = { invoices };
        }
        else if (call.name === "get_top_debtors") {
          const debtors = await Customer.findAll({
            where: { company_id: companyId, outstanding_balance: { [Op.gt]: 0 } },
            order: [['outstanding_balance', 'DESC']],
            limit: 5,
            attributes: ['name', 'outstanding_balance', 'phone']
          });
          functionResponseData = { debtors };
        }

        // Send the function response back to the model
        const secondResult = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: functionResponseData
          }
        }]);
        
        response = await secondResult.response;
      } catch (err) {
        console.error("Function call execution error:", err);
        const errorResult = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: { error: "Failed to fetch data from database." }
          }
        }]);
        response = await errorResult.response;
      }
    }

    const text = response.text();

    if (text) {
      await usage.increment('count');
      res.json({ answer: text, usage: usage.count + 1, limit: dailyLimit });
    } else {
      res.status(200).json({ answer: "I'm having trouble connecting right now. Please try again." });
    }

  } catch (error) {
    console.error("Charis Assistant error:", error);
    res.status(500).json({ 
      error: "Charis is temporarily unavailable", 
      details: error.message 
    });
  }
};

// PDF Processing Helper
const processPDFExtract = async (req, res) => {
  const companyId = req.companyId;
  
  try {
    const { extractedText, documentType } = req.body;
    
    if (!extractedText) {
      return res.status(400).json({ error: "No text extracted from PDF" });
    }

    // Use Gemini to parse the PDF content
    const prompt = `Extract product information from this ${documentType} and return JSON format:
    {
      "items": [
        {
          "name": "product name",
          "hsn_code": "HSN code if available",
          "quantity": number,
          "unit_price": number,
          "gst_rate": 5/12/18/28,
          "is_new_product": true/false
        }
      ],
      "supplier_name": "supplier name if available",
      "invoice_number": "invoice number",
      "invoice_date": "date"
    }
    
    Document text: ${extractedText.substring(0, 3000)}`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const parsedData = JSON.parse(response.text());

    // Create or update products
    const createdItems = [];
    for (const item of parsedData.items) {
      let product = await Product.findOne({
        where: { 
          company_id: companyId,
          name: { [Op.iLike]: item.name }
        }
      });

      if (!product) {
        // Create new product
        product = await Product.create({
          company_id: companyId,
          name: item.name,
          hsn_code: item.hsn_code || '',
          gst_rate: item.gst_rate || 18,
          sale_price: item.unit_price * 1.2, // 20% markup
          purchase_price: item.unit_price,
          stock_quantity: item.quantity,
          low_stock_alert: 10,
          unit: 'PCS'
        });
        createdItems.push({ name: item.name, action: 'created', quantity: item.quantity });
      } else {
        // Update existing product stock
        await product.increment('stock_quantity', { by: item.quantity });
        createdItems.push({ name: item.name, action: 'stock_added', quantity: item.quantity });
      }
    }

    res.json({
      success: true,
      message: `Processed ${createdItems.length} items`,
      items: createdItems,
      supplier: parsedData.supplier_name
    });

  } catch (error) {
    // PDF processing error logged
    res.status(500).json({ error: "Failed to process PDF", details: error.message });
  }
};

module.exports = {
  chatWithAssistant,
  processPDFExtract
};
