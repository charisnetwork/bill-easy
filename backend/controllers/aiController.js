const { Invoice, InvoiceItem, Product, Company, Expense, Customer } = require("../models");
const { Op, col, fn, literal } = require("sequelize");
const aiProvider = require("../services/aiProvider");
const aiQuickSearch = require("../services/aiQuickSearch");
const { consumeMonthly, refundMonthly, QuotaError } = require("../services/usageLimits");
const charisOs = require("../services/charisOsService");

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

const tool = (name, description, properties = {}, required = []) => ({
  type: 'function',
  function: { name, description, parameters: { type: 'object', properties, required } },
});

const CHARIS_TOOLS = [
  tool('get_low_stock_products', 'Products at or below their low-stock alert level. Use for lowest stock, running out, or reorder questions.'),
  tool('search_product', 'Find a product by name: price, stock, HSN code and tax rate.', { product_name: { type: 'string', description: 'Product name to search for' } }, ['product_name']),
  tool('get_financial_summary', "Today's sales, total sales, total expenses and net profit."),
  tool('get_recent_invoices', 'The 5 most recent invoices with totals, customer names and status.'),
  tool('get_top_debtors', 'The 5 customers who owe the most (highest outstanding balance).'),
  tool('get_sales_by_item', 'Sales per item: quantity sold, sales value and GST collected, best sellers first. Use for "which item sells most", item-wise GST or what to restock.'),
];

/** Runs one tool call against this business's data only. */
async function runTool(companyId, call) {
  switch (call.name) {
    case 'get_low_stock_products':
      return { products: await Product.findAll({ where: { company_id: companyId, stock_quantity: { [Op.lte]: col('low_stock_alert') } }, order: [['stock_quantity', 'ASC']], limit: 10, attributes: ['name', 'stock_quantity', 'low_stock_alert'], raw: true }) };
    case 'search_product':
      return { products: await Product.findAll({ where: { company_id: companyId, name: { [Op.iLike]: `%${String(call.arguments.product_name || '').replace(/[\\%_]/g, '\\$&')}%` } }, limit: 5, attributes: ['name', 'stock_quantity', 'sale_price', 'hsn_code', 'gst_rate'], raw: true }) };
    case 'get_financial_summary': {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const [total, today, expenses] = await Promise.all([
        Invoice.sum('total_amount', { where: { company_id: companyId } }),
        Invoice.sum('total_amount', { where: { company_id: companyId, invoice_date: { [Op.gte]: todayStart } } }),
        Expense.sum('amount', { where: { company_id: companyId } }),
      ]);
      return { today_sales: Number(today || 0), total_sales: Number(total || 0), total_expenses: Number(expenses || 0), net_profit: Number(total || 0) - Number(expenses || 0) };
    }
    case 'get_recent_invoices':
      return { invoices: await Invoice.findAll({ where: { company_id: companyId }, include: [{ model: Customer, attributes: ['name'] }], order: [['invoice_date', 'DESC']], limit: 5, attributes: ['invoice_number', 'total_amount', 'payment_status', 'invoice_date'] }) };
    case 'get_top_debtors':
      return { debtors: await Customer.findAll({ where: { company_id: companyId, outstanding_balance: { [Op.gt]: 0 } }, order: [['outstanding_balance', 'DESC']], limit: 5, attributes: ['name', 'outstanding_balance', 'phone'], raw: true }) };
    case 'get_sales_by_item': {
      const rows = await InvoiceItem.findAll({
        attributes: ['product_id', [fn('SUM', col('InvoiceItem.quantity')), 'quantity'], [fn('SUM', col('InvoiceItem.total')), 'sales_value'], [fn('SUM', col('InvoiceItem.tax_amount')), 'gst']],
        include: [{ model: Invoice, attributes: [], where: { company_id: companyId, status: { [Op.ne]: 'cancelled' } } }, { model: Product, attributes: ['name'] }],
        group: ['product_id', 'Product.id'], order: [[literal('sales_value'), 'DESC']], limit: 10,
      });
      return { items: rows.map((r) => ({ name: r.Product?.name, quantity: Number(r.get('quantity')), sales_value: Number(r.get('sales_value')), gst: Number(r.get('gst') || 0) })) };
    }
    default:
      return { error: 'Unknown tool' };
  }
}

const MAX_TOOL_ROUNDS = 3;

// Whole words only: "HSN code" or a travel agency's question must still reach the assistant.
const BLOCKED_TOPICS = [
  'coding', 'programming', 'python', 'javascript', 'java', 'c++',
  'news', 'weather', 'sports', 'cricket', 'football', 'movie', 'film', 'song',
  'recipe', 'politics', 'election', 'stock market', 'crypto',
  'bitcoin', 'game', 'gaming', 'playstation', 'xbox', 'dating', 'relationship'
];
const OFF_TOPIC_ANSWER = "🚫 I'm Charis, your Bill Easy business assistant. I cannot help with coding, news, entertainment, or general topics.\n\n✅ I can help you with:\n• Creating invoices, e-way bills, purchase orders\n• Generating sales, GST, and stock reports\n• Managing products and inventory\n• Bill Easy platform features\n\nHow can I assist with your billing or inventory today?";

/**
 * Charis assistant. Database quick searches and off-topic refusals are free; a question the
 * AI model answers uses one ai_messages unit, given back if the model fails.
 */
const chatWithAssistant = async (req, res) => {
  const companyId = req.companyId;
  const question = String(req.body?.question || '').trim().slice(0, 2000);
  if (!question) return res.status(400).json({ error: 'Please type a question.' });

  const lower = question.toLowerCase();
  if (BLOCKED_TOPICS.some((topic) => new RegExp(`\\b${topic.replace(/[+]/g, '\\+')}\\b`).test(lower))) return res.json({ answer: OFF_TOPIC_ANSWER, source: 'rules' });

  let unit;
  try {
    const quick = await aiQuickSearch.answer(companyId, question);
    if (quick) return res.json({ answer: quick.reply, source: 'quick_search' });

    aiProvider.config(); // Not configured: refuse before taking a message.
    unit = await consumeMonthly(companyId, 'ai_messages');

    const company = await Company.findByPk(companyId, { attributes: ['name'] });
    const messages = [
      { role: 'system', content: `${CHARIS_SYSTEM_INSTRUCTION}\n\nYou are assisting the business named "${company?.name || 'your business'}". Use the tools when the user asks for their own data. Amounts are in Indian rupees (₹).` },
      { role: 'user', content: question },
    ];
    let result = await aiProvider.chat({ messages, tools: CHARIS_TOOLS });
    // Up to three rounds of tool calls; the last call forbids tools so the model must answer.
    for (let round = 0; round < MAX_TOOL_ROUNDS && result.toolCalls.length > 0; round++) {
      messages.push(result.message);
      for (const call of result.toolCalls) {
        let output;
        try { output = await runTool(companyId, call); }
        catch (error) { console.error('[AI] tool failed:', call.name, error.message); output = { error: 'Failed to fetch data.' }; }
        messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(output) });
      }
      const last = round === MAX_TOOL_ROUNDS - 1;
      result = await aiProvider.chat({ messages, tools: CHARIS_TOOLS, toolChoice: last ? 'none' : undefined });
    }
    if (!result.content) throw new aiProvider.AiUnavailableError();
    return res.json({ answer: result.content, source: 'ai', usage: unit });
  } catch (error) {
    if (error instanceof aiProvider.AiUnavailableError) {
      if (unit) await refundMonthly(companyId, 'ai_messages').catch(() => {});
      return res.status(503).json({ error: error.message, code: error.code });
    }
    if (error instanceof QuotaError) return res.status(403).json({ error: error.message, code: error.code, feature: error.feature, limit: error.limit, used: error.used, upgradeRequired: true });
    if (error instanceof charisOs.CharisOsError) return res.status(error.status).json({ error: error.message, code: error.code, feature: 'ai_messages', upgradeRequired: error.status === 403 });
    if (unit) await refundMonthly(companyId, 'ai_messages').catch(() => {});
    console.error('Charis Assistant error:', error);
    return res.status(500).json({ error: 'Charis is temporarily unavailable' });
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

    const result = await aiProvider.chat({ messages: [{ role: 'user', content: `${prompt}\n\nReply with the JSON only.` }], json: true, maxTokens: 2000, temperature: 0 });
    const parsedData = JSON.parse(result.content.replace(/^```(?:json)?|```$/g, '').trim());
    if (!Array.isArray(parsedData.items)) throw new Error('The document could not be read');

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
    if (error instanceof aiProvider.AiUnavailableError) return res.status(503).json({ error: error.message, code: error.code });
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? "Failed to process PDF" : "Failed to process PDF: " + error.message });
  }
};

module.exports = {
  chatWithAssistant,
  processPDFExtract
};
