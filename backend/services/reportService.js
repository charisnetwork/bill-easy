const { Invoice, Purchase, Expense, Customer, Supplier, Product, InvoiceItem, PurchaseItem, UserCompany, Company, sequelize } = require('../models');
const { Op } = require('sequelize');

class ReportService {
  static async getSalesReport(companyId, startDate, endDate) {
    const where = {
      company_id: companyId,
      invoice_date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      },
      status: { [Op.ne]: 'cancelled' }
    };

    const invoices = await Invoice.findAll({
      where,
      include: [{ model: Customer }],
      order: [['invoice_date', 'DESC']]
    });

    const summary = await Invoice.findOne({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_sales'],
        [sequelize.fn('SUM', sequelize.col('tax_amount')), 'total_tax'],
        [sequelize.fn('SUM', sequelize.col('paid_amount')), 'total_received'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'invoice_count']
      ],
      raw: true
    });

    return { 
      invoices, 
      summary: {
        total_sales: Number(summary?.total_sales || 0),
        total_tax: Number(summary?.total_tax || 0),
        total_received: Number(summary?.total_received || 0),
        invoice_count: Number(summary?.invoice_count || 0)
      } 
    };
  }

  static async getPurchaseReport(companyId, startDate, endDate) {
    const where = {
      company_id: companyId,
      bill_date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      },
      status: { [Op.ne]: 'cancelled' }
    };

    const purchases = await Purchase.findAll({
      where,
      include: [{ model: Supplier }],
      order: [['bill_date', 'DESC']]
    });

    const summary = await Purchase.findOne({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_purchases'],
        [sequelize.fn('SUM', sequelize.col('tax_amount')), 'total_tax'],
        [sequelize.fn('SUM', sequelize.col('paid_amount')), 'total_paid'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'purchase_count']
      ],
      raw: true
    });

    return { 
      purchases, 
      summary: {
        total_purchases: Number(summary?.total_purchases || 0),
        total_tax: Number(summary?.total_tax || 0),
        total_paid: Number(summary?.total_paid || 0),
        purchase_count: Number(summary?.purchase_count || 0)
      }
    };
  }

  static async getExpenseReport(companyId, startDate, endDate) {
    const where = {
      company_id: companyId,
      date: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    const expenses = await Expense.findAll({
      where,
      order: [['date', 'DESC']]
    });

    const byCategory = await Expense.findAll({
      where,
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['category'],
      raw: true
    });

    const totalExpenses = await Expense.sum('amount', { where }) || 0;

    return { 
      expenses, 
      byCategory: byCategory.map(c => ({ category: c.category, total: Number(c.total || 0) })), 
      totalExpenses: Number(totalExpenses) 
    };
  }

  static async getProfitLossReport(companyId, startDate, endDate) {
    const salesReport = await this.getSalesReport(companyId, startDate, endDate);
    const purchaseReport = await this.getPurchaseReport(companyId, startDate, endDate);
    const expenseReport = await this.getExpenseReport(companyId, startDate, endDate);

    const totalSales = Number(salesReport.summary?.total_sales || 0);
    const totalPurchases = Number(purchaseReport.summary?.total_purchases || 0);
    const totalExpenses = Number(expenseReport.totalExpenses || 0);

    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin: totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(2) : 0
    };
  }

  static async getGSTReport(companyId, startDate, endDate) {
    const salesWhere = {
      company_id: companyId,
      invoice_date: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      status: { [Op.ne]: 'cancelled' }
    };

    const purchaseWhere = {
      company_id: companyId,
      bill_date: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      status: { [Op.ne]: 'cancelled' }
    };

    const outputGST = await Invoice.sum('tax_amount', { where: salesWhere }) || 0;
    const inputGST = await Purchase.sum('tax_amount', { where: purchaseWhere }) || 0;
    const netGST = Number(outputGST) - Number(inputGST);

    return {
      outputGST: Number(outputGST),
      inputGST: Number(inputGST),
      netGST: Number(netGST),
      gstPayable: netGST > 0 ? netGST : 0,
      gstCredit: netGST < 0 ? Math.abs(netGST) : 0
    };
  }

  static async getCustomerOutstanding(companyId) {
    const customers = await Customer.findAll({
      where: {
        company_id: companyId,
        outstanding_balance: { [Op.gt]: 0 }
      },
      order: [['outstanding_balance', 'DESC']]
    });

    const total = await Customer.sum('outstanding_balance', {
      where: { company_id: companyId, outstanding_balance: { [Op.gt]: 0 } }
    }) || 0;

    return { customers, total: Number(total) };
  }

  static async getSupplierOutstanding(companyId) {
    const suppliers = await Supplier.findAll({
      where: {
        company_id: companyId,
        outstanding_balance: { [Op.gt]: 0 }
      },
      order: [['outstanding_balance', 'DESC']]
    });

    const total = await Supplier.sum('outstanding_balance', {
      where: { company_id: companyId, outstanding_balance: { [Op.gt]: 0 } }
    }) || 0;

    return { suppliers, total: Number(total) };
  }

  static async getStockReport(companyId) {
    const products = await Product.findAll({
      where: { company_id: companyId },
      order: [['stock_quantity', 'ASC']]
    });

    const lowStock = products.filter(p => 
      Number(p.stock_quantity) <= Number(p.low_stock_alert)
    );

    const totalStockValue = products.reduce((sum, p) => 
      sum + (Number(p.stock_quantity) * Number(p.purchase_price)), 0
    );

    return { products, lowStock, totalStockValue: Number(totalStockValue) };
  }

  static async getDashboardSummary(companyId, user = null, now = new Date()) {
    const { QueryTypes } = require('sequelize');
    const figures = require('./dashboardFigures');
    const q = (sql, replacements = {}) => sequelize.query(sql, { type: QueryTypes.SELECT, replacements: { companyId, ...replacements } });
    const num = (v) => Number(v || 0);
    const IST = `'Asia/Kolkata'`;
    const monthOf = (col) => `to_char(${col} AT TIME ZONE ${IST}, 'YYYY-MM')`;

    const months = figures.lastMonths(now, 6);
    const range = { start: months[0].start, end: months[months.length - 1].end };
    const { days, start: daysStart, end: daysEnd } = figures.lastDays(now, 14);
    const { y, m, d } = figures.istParts(now);
    const todayStart = figures.istStart(y, m, d);
    const thisMonth = months[months.length - 1];
    const soon = new Date(todayStart.getTime() + 15 * 24 * 60 * 60 * 1000);

    const [
      sales, purchases, expenses, received, upfrontReceived, made, upfrontPaid,
      daily, todayRow, pendingRow, overdueRow, lowStockRows, lowStockCount,
      receivables, recentInvoices, topProducts, dueSoon, activity, invoicesCount, productsCount,
      company, activeBusinessesCount,
    ] = await Promise.all([
      q(`SELECT ${monthOf('invoice_date')} AS month, SUM(total_amount) AS total, COUNT(*) AS count FROM invoices
         WHERE company_id = :companyId AND status <> 'cancelled' AND invoice_date >= :start AND invoice_date < :end GROUP BY 1`, range),
      q(`SELECT ${monthOf('bill_date')} AS month, SUM(total_amount) AS total FROM purchases
         WHERE company_id = :companyId AND status <> 'cancelled' AND bill_date >= :start AND bill_date < :end GROUP BY 1`, range),
      q(`SELECT ${monthOf('date')} AS month, SUM(amount) AS total FROM expenses
         WHERE company_id = :companyId AND date >= :start AND date < :end GROUP BY 1`, range),
      // Money in: payments recorded against customers, plus what was paid when the invoice was made
      // (paid_amount not covered by a payment record or the customer's wallet).
      q(`SELECT ${monthOf('payment_date')} AS month, SUM(amount) AS total FROM payments
         WHERE company_id = :companyId AND payment_type = 'received' AND payment_date >= :start AND payment_date < :end GROUP BY 1`, range),
      q(`SELECT ${monthOf('i.invoice_date')} AS month,
                SUM(GREATEST(i.paid_amount - COALESCE(i.wallet_amount, 0) - COALESCE(p.total, 0), 0)) AS total
         FROM invoices i
         LEFT JOIN (SELECT invoice_id, SUM(amount) AS total FROM payments
                    WHERE company_id = :companyId AND payment_type = 'received' AND invoice_id IS NOT NULL GROUP BY invoice_id) p ON p.invoice_id = i.id
         WHERE i.company_id = :companyId AND i.status <> 'cancelled' AND i.invoice_date >= :start AND i.invoice_date < :end GROUP BY 1`, range),
      // Money out: payments made to suppliers, plus what was paid when the bill was entered.
      q(`SELECT ${monthOf('payment_date')} AS month, SUM(amount) AS total FROM payments
         WHERE company_id = :companyId AND payment_type = 'made' AND payment_date >= :start AND payment_date < :end GROUP BY 1`, range),
      q(`SELECT ${monthOf('b.bill_date')} AS month, SUM(GREATEST(b.paid_amount - COALESCE(p.total, 0), 0)) AS total
         FROM purchases b
         LEFT JOIN (SELECT purchase_id, SUM(amount) AS total FROM payments
                    WHERE company_id = :companyId AND payment_type = 'made' AND purchase_id IS NOT NULL GROUP BY purchase_id) p ON p.purchase_id = b.id
         WHERE b.company_id = :companyId AND b.status <> 'cancelled' AND b.bill_date >= :start AND b.bill_date < :end GROUP BY 1`, range),
      q(`SELECT to_char(invoice_date AT TIME ZONE ${IST}, 'YYYY-MM-DD') AS day, SUM(total_amount) AS total FROM invoices
         WHERE company_id = :companyId AND status <> 'cancelled' AND invoice_date >= :start AND invoice_date < :end GROUP BY 1`,
        { start: daysStart, end: daysEnd }),
      q(`SELECT SUM(total_amount) AS total FROM invoices
         WHERE company_id = :companyId AND status <> 'cancelled' AND invoice_date >= :start AND invoice_date < :end`,
        { start: todayStart, end: daysEnd }),
      q(`SELECT SUM(total_amount - paid_amount) AS total, COUNT(*) AS count FROM invoices
         WHERE company_id = :companyId AND status <> 'cancelled' AND payment_status IN ('unpaid', 'partial')`),
      q(`SELECT SUM(total_amount - paid_amount) AS total, COUNT(*) AS count FROM invoices
         WHERE company_id = :companyId AND status <> 'cancelled' AND payment_status IN ('unpaid', 'partial') AND due_date < :today`,
        { today: todayStart }),
      q(`SELECT id, name, unit, stock_quantity, low_stock_alert FROM products
         WHERE company_id = :companyId AND COALESCE(type, 'product') <> 'service' AND stock_quantity <= low_stock_alert
         ORDER BY stock_quantity / NULLIF(low_stock_alert, 0) ASC NULLS FIRST, name LIMIT 5`),
      q(`SELECT COUNT(*) AS count FROM products
         WHERE company_id = :companyId AND COALESCE(type, 'product') <> 'service' AND stock_quantity <= low_stock_alert`),
      q(`SELECT c.id, c.name, c.phone, SUM(i.total_amount - i.paid_amount) AS amount, COUNT(*) AS invoices, MIN(i.due_date) AS oldest_due
         FROM invoices i JOIN customers c ON c.id = i.customer_id
         WHERE i.company_id = :companyId AND i.status <> 'cancelled' AND i.payment_status IN ('unpaid', 'partial')
         GROUP BY c.id, c.name, c.phone HAVING SUM(i.total_amount - i.paid_amount) > 0 ORDER BY amount DESC LIMIT 5`),
      q(`SELECT i.id, i.invoice_number, c.name AS customer, i.total_amount, i.paid_amount, i.payment_status, i.status, i.invoice_date, i.due_date
         FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id
         WHERE i.company_id = :companyId ORDER BY i.invoice_date DESC, i.created_at DESC LIMIT 10`),
      q(`SELECT p.id, p.name, SUM(ii.total) AS revenue, SUM(ii.quantity) AS quantity
         FROM invoice_items ii JOIN invoices i ON i.id = ii.invoice_id JOIN products p ON p.id = ii.product_id
         WHERE i.company_id = :companyId AND i.status <> 'cancelled' AND i.invoice_date >= :start AND i.invoice_date < :end
         GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 5`, { start: thisMonth.start, end: thisMonth.end }),
      q(`(SELECT 'receivable' AS kind, i.id, i.invoice_number AS ref, c.name AS party, i.total_amount - i.paid_amount AS amount, i.due_date
          FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id
          WHERE i.company_id = :companyId AND i.status <> 'cancelled' AND i.payment_status IN ('unpaid', 'partial') AND i.due_date >= :today AND i.due_date < :soon)
         UNION ALL
         (SELECT 'payable' AS kind, b.id, b.bill_number AS ref, s.name AS party, b.total_amount - b.paid_amount AS amount, b.due_date
          FROM purchases b LEFT JOIN suppliers s ON s.id = b.supplier_id
          WHERE b.company_id = :companyId AND b.status <> 'cancelled' AND b.payment_status IN ('unpaid', 'partial') AND b.due_date >= :today AND b.due_date < :soon)
         ORDER BY due_date ASC LIMIT 6`, { today: todayStart, soon }),
      q(`SELECT * FROM (
           (SELECT 'invoice' AS type, i.id, i.invoice_number AS ref, c.name AS party, i.total_amount AS amount, i.created_at
            FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id WHERE i.company_id = :companyId ORDER BY i.created_at DESC LIMIT 8)
           UNION ALL
           (SELECT CASE WHEN p.payment_type = 'received' THEN 'payment_in' ELSE 'payment_out' END, p.id, p.reference_number, COALESCE(c.name, s.name), p.amount, p.created_at
            FROM payments p LEFT JOIN customers c ON c.id = p.customer_id LEFT JOIN suppliers s ON s.id = p.supplier_id
            WHERE p.company_id = :companyId ORDER BY p.created_at DESC LIMIT 8)
           UNION ALL
           (SELECT 'purchase', b.id, b.bill_number, s.name, b.total_amount, b.created_at
            FROM purchases b LEFT JOIN suppliers s ON s.id = b.supplier_id WHERE b.company_id = :companyId ORDER BY b.created_at DESC LIMIT 8)
           UNION ALL
           (SELECT 'expense', e.id, e.category, NULL, e.amount, e.created_at FROM expenses e WHERE e.company_id = :companyId ORDER BY e.created_at DESC LIMIT 8)
           UNION ALL
           (SELECT 'customer', cu.id, NULL, cu.name, NULL, cu.created_at FROM customers cu WHERE cu.company_id = :companyId ORDER BY cu.created_at DESC LIMIT 8)
         ) a ORDER BY created_at DESC LIMIT 8`),
      Invoice.count({ where: { company_id: companyId, status: { [Op.ne]: 'cancelled' }, invoice_date: { [Op.gte]: thisMonth.start, [Op.lt]: thisMonth.end } } }),
      Product.count({ where: { company_id: companyId } }),
      Company.findByPk(companyId, { attributes: ['gst_number', 'gst_registered'] }),
      user ? UserCompany.count({ where: { user_id: user.id } }) : Promise.resolve(1),
    ]);

    // Business limit from the owner's Charis OS plan (1 when OS cannot be reached).
    let totalBusinessesLimit = 1;
    try { totalBusinessesLimit = await require('./charisOsService').businessLimit(companyId); } catch { /* keep 1 */ }

    const byMonth = (rows) => Object.fromEntries(rows.map((r) => [r.month, num(r.total)]));
    const [salesM, purchasesM, expensesM, receivedM, upfrontInM, madeM, upfrontOutM] =
      [sales, purchases, expenses, received, upfrontReceived, made, upfrontPaid].map(byMonth);
    const monthly = months.map(({ key }) => {
      const s = salesM[key] || 0;
      const p = purchasesM[key] || 0;
      const e = expensesM[key] || 0;
      const moneyIn = (receivedM[key] || 0) + (upfrontInM[key] || 0);
      return {
        month: key,
        label: figures.monthLabel(key),
        sales: s,
        purchases: p,
        expenses: e,
        profit: s - p - e,
        collections: moneyIn,
        moneyOut: (madeM[key] || 0) + (upfrontOutM[key] || 0) + e,
      };
    });
    const current = monthly[monthly.length - 1];
    const previous = monthly[monthly.length - 2];
    const comparison = Object.fromEntries(['sales', 'profit', 'expenses', 'collections'].map((k) => [k, {
      current: current[k],
      previous: previous[k],
      change: figures.percentChange(current[k], previous[k]),
    }]));

    const dailyMap = Object.fromEntries(daily.map((r) => [r.day, num(r.total)]));
    const pendingAmount = num(pendingRow[0]?.total);
    const overdueAmount = num(overdueRow[0]?.total);

    return {
      // Kept for existing callers.
      todaySales: num(todayRow[0]?.total),
      monthlySales: current.sales,
      pendingPayments: pendingAmount,
      monthlyExpenses: current.expenses,
      grossProfit: current.sales - current.purchases,
      netProfit: current.profit,
      salesChartData: days.slice(-7).map((day) => ({ date: day, sales: dailyMap[day] || 0 })),
      invoicesCount,
      productsCount,
      activeBusinessesCount: activeBusinessesCount || 1,
      totalBusinessesLimit,

      thisMonth: current,
      lastMonth: previous,
      comparison,
      monthly,
      dailySales: days.map((day) => ({ date: day, sales: dailyMap[day] || 0 })),
      receivables: {
        pendingAmount,
        pendingCount: num(pendingRow[0]?.count),
        overdueAmount,
        overdueCount: num(overdueRow[0]?.count),
        topCustomers: receivables.map((r) => ({ id: r.id, name: r.name, phone: r.phone, amount: num(r.amount), invoices: num(r.invoices), oldestDue: r.oldest_due })),
      },
      lowStock: {
        count: num(lowStockCount[0]?.count),
        items: lowStockRows.map((r) => ({ id: r.id, name: r.name, unit: r.unit, stock: num(r.stock_quantity), minimum: num(r.low_stock_alert) })),
      },
      gst: { registered: Boolean(company?.gst_registered || company?.gst_number), dueDates: figures.gstDueDates(now) },
      upcomingDues: dueSoon.map((r) => ({ kind: r.kind, id: r.id, ref: r.ref, party: r.party, amount: num(r.amount), dueDate: r.due_date })),
      recentInvoices: recentInvoices.map((r) => ({
        id: r.id, number: r.invoice_number, customer: r.customer, amount: num(r.total_amount), paid: num(r.paid_amount),
        paymentStatus: r.payment_status, status: r.status, date: r.invoice_date, dueDate: r.due_date,
      })),
      topProducts: topProducts.map((r) => ({ id: r.id, name: r.name, revenue: num(r.revenue), quantity: num(r.quantity) })),
      recentActivity: activity.map((r) => ({ type: r.type, id: r.id, ref: r.ref, party: r.party, amount: r.amount === null ? null : num(r.amount), at: r.created_at })),
      health: figures.healthScore({ thisMonth: current, lastMonth: previous, pendingAmount, overdueAmount }),
    };
  }
  // --- ADVANCED & PREMIUM REPORTS ---
  
  static async getDaybook(companyId, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Daybook aggregates all transactions for the period ordered by date
    const sales = await Invoice.findAll({
      where: { company_id: companyId, invoice_date: { [Op.between]: [start, end] } },
      attributes: ['invoice_date', 'invoice_number', 'total_amount', 'payment_status', 'customer_name'],
      raw: true
    });
    const purchases = await Purchase.findAll({
      where: { company_id: companyId, bill_date: { [Op.between]: [start, end] } },
      attributes: ['bill_date', 'bill_number', 'total_amount', 'payment_status'],
      raw: true
    });
    const expenses = await Expense.findAll({
      where: { company_id: companyId, date: { [Op.between]: [start, end] } },
      attributes: ['date', 'category', 'amount', 'description'],
      raw: true
    });

    const daybook = [];
    sales.forEach(s => daybook.push({ date: s.invoice_date, type: 'Sale', ref: s.invoice_number, amount: s.total_amount, party: s.customer_name }));
    purchases.forEach(p => daybook.push({ date: p.bill_date, type: 'Purchase', ref: p.bill_number, amount: -p.total_amount, party: 'Supplier' }));
    expenses.forEach(e => daybook.push({ date: e.date, type: 'Expense', ref: e.category, amount: -e.amount, party: e.description }));

    daybook.sort((a, b) => new Date(a.date) - new Date(b.date));
    return daybook;
  }

  static async getCashAndBankReport(companyId, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // In a real system, you'd check Payment records. We approximate with paid invoices/purchases.
    const salesReceived = await Invoice.sum('paid_amount', { where: { company_id: companyId, invoice_date: { [Op.between]: [start, end] } } }) || 0;
    const purchasesPaid = await Purchase.sum('paid_amount', { where: { company_id: companyId, bill_date: { [Op.between]: [start, end] } } }) || 0;
    const expensesPaid = await Expense.sum('amount', { where: { company_id: companyId, date: { [Op.between]: [start, end] } } }) || 0;

    return {
      cashIn: Number(salesReceived),
      cashOut: Number(purchasesPaid) + Number(expensesPaid),
      netCashFlow: Number(salesReceived) - (Number(purchasesPaid) + Number(expensesPaid))
    };
  }

  static async getGSTSales(companyId, startDate, endDate) {
    // Equivalent to GSTR-1
    return await this.getSalesReport(companyId, startDate, endDate);
  }

  static async getGSTPurchase(companyId, startDate, endDate) {
    // Equivalent to GSTR-2
    return await this.getPurchaseReport(companyId, startDate, endDate);
  }

  static async getHSNWiseSales(companyId, startDate, endDate) {
    // Fetch all invoice items for the period and group by HSN
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const invoices = await Invoice.findAll({
      where: { company_id: companyId, invoice_date: { [Op.between]: [start, end] }, status: { [Op.ne]: 'cancelled' } },
      attributes: ['id'],
      raw: true
    });
    
    if(!invoices.length) return [];
    const invoiceIds = invoices.map(i => i.id);

    const items = await InvoiceItem.findAll({
      where: { invoice_id: { [Op.in]: invoiceIds } },
      include: [{ model: Product, attributes: ['hsn_code', 'name'] }]
    });

    const hsnMap = {};
    items.forEach(item => {
      const hsn = item.Product?.hsn_code || 'Unknown';
      if(!hsnMap[hsn]) hsnMap[hsn] = { hsn, name: item.Product?.name, quantity: 0, taxableValue: 0, taxAmount: 0 };
      hsnMap[hsn].quantity += Number(item.quantity);
      hsnMap[hsn].taxableValue += (Number(item.quantity) * Number(item.price));
      // Approximation for tax amount per item if not stored directly
      hsnMap[hsn].taxAmount += ((Number(item.quantity) * Number(item.price)) * (Number(item.gst_rate) || 0) / 100);
    });

    return Object.values(hsnMap);
  }

  static async getBillWiseProfit(companyId, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const invoices = await Invoice.findAll({
      where: { company_id: companyId, invoice_date: { [Op.between]: [start, end] }, status: { [Op.ne]: 'cancelled' } },
      include: [{ model: InvoiceItem, include: [Product] }]
    });

    const billProfits = invoices.map(inv => {
      let totalCost = 0;
      inv.InvoiceItems.forEach(item => {
        const costPrice = item.Product?.purchase_price || 0;
        totalCost += (costPrice * item.quantity);
      });
      const revenue = Number(inv.total_amount) - Number(inv.tax_amount); // Revenue excluding tax
      return {
        invoice_number: inv.invoice_number,
        date: inv.invoice_date,
        revenue: revenue,
        cost: totalCost,
        profit: revenue - totalCost,
        margin: revenue > 0 ? ((revenue - totalCost) / revenue * 100).toFixed(2) : 0
      };
    });

    return billProfits;
  }

  static async getBalanceSheet(companyId, startDate, endDate) {
    const pl = await this.getProfitLossReport(companyId, startDate, endDate);
    const custOut = await this.getCustomerOutstanding(companyId);
    const suppOut = await this.getSupplierOutstanding(companyId);
    const stock = await this.getStockReport(companyId);
    const cash = await this.getCashAndBankReport(companyId, startDate, endDate);

    return {
      assets: {
        cashAndBank: cash.netCashFlow > 0 ? cash.netCashFlow : 0,
        accountsReceivable: custOut.total,
        inventory: stock.totalStockValue,
        totalAssets: (cash.netCashFlow > 0 ? cash.netCashFlow : 0) + custOut.total + stock.totalStockValue
      },
      liabilities: {
        accountsPayable: suppOut.total,
        shortTermLoans: 0,
        totalLiabilities: suppOut.total
      },
      equity: {
        retainedEarnings: pl.netProfit,
        totalEquity: pl.netProfit
      }
    };
  }

  static async getGSTR3b(companyId, startDate, endDate) {
    const gst = await this.getGSTReport(companyId, startDate, endDate);
    // GSTR3B is a summary return
    return {
      outwardTaxableSupplies: gst.outputGST, // Simplified
      eligibleITC: gst.inputGST,
      netTaxPayable: gst.gstPayable
    };
  }

  static async getTDSTCS(companyId, startDate, endDate) {
    // Simplified placeholders as TDS/TCS aren't tracked natively yet
    return {
      tdsPayable: 0,
      tdsReceivable: 0,
      tcsPayable: 0,
      tcsReceivable: 0
    };
  }

  static async getCashFlowTaxSnapshot(companyId, startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const realizedRevenueSum = await Invoice.sum('paid_amount', {
      where: {
        company_id: companyId,
        invoice_date: { [Op.between]: [start, end] },
        status: { [Op.ne]: 'cancelled' }
      }
    }) || 0;

    const unpaidInvoices = await Invoice.findAll({
      where: {
        company_id: companyId,
        payment_status: { [Op.in]: ['unpaid', 'partial'] },
        status: { [Op.ne]: 'cancelled' }
      },
      attributes: ['id', 'invoice_number', 'invoice_date', 'due_date', 'total_amount', 'paid_amount']
    });

    const now = new Date();
    let current = 0;
    let thirtyToSixty = 0;
    let sixtyToNinety = 0;
    let overNinety = 0;
    let totalOutstanding = 0;

    unpaidInvoices.forEach(inv => {
      const balance = Number(inv.total_amount || 0) - Number(inv.paid_amount || 0);
      if (balance <= 0) return;

      totalOutstanding += balance;
      const refDate = new Date(inv.due_date || inv.invoice_date);
      const diffDays = Math.floor((now - refDate) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) current += balance;
      else if (diffDays <= 60) thirtyToSixty += balance;
      else if (diffDays <= 90) sixtyToNinety += balance;
      else overNinety += balance;
    });

    const outputGST = await Invoice.sum('tax_amount', {
      where: {
        company_id: companyId,
        invoice_date: { [Op.between]: [start, end] },
        status: { [Op.ne]: 'cancelled' }
      }
    }) || 0;

    const inputGSTPurchases = await Purchase.sum('tax_amount', {
      where: {
        company_id: companyId,
        bill_date: { [Op.between]: [start, end] },
        status: { [Op.ne]: 'cancelled' }
      }
    }) || 0;

    const netGSTPayable = Number(outputGST) - Number(inputGSTPurchases);

    const cashFlowTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const cashIn = await Invoice.sum('paid_amount', {
        where: {
          company_id: companyId,
          invoice_date: { [Op.between]: [monthStart, monthEnd] },
          status: { [Op.ne]: 'cancelled' }
        }
      }) || 0;

      const purchasePaid = await Purchase.sum('paid_amount', {
        where: {
          company_id: companyId,
          bill_date: { [Op.between]: [monthStart, monthEnd] },
          status: { [Op.ne]: 'cancelled' }
        }
      }) || 0;

      const expensePaid = await Expense.sum('amount', {
        where: {
          company_id: companyId,
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const cashOut = Number(purchasePaid) + Number(expensePaid);
      const monthLabel = monthStart.toLocaleString('default', { month: 'short', year: 'numeric' });

      cashFlowTrend.push({
        month: monthLabel,
        cashIn: Number(cashIn),
        cashOut: Number(cashOut),
        netFlow: Number(cashIn) - Number(cashOut)
      });
    }

    return {
      realizedRevenue: Number(realizedRevenueSum),
      receivablesAging: {
        current: Number(current),
        thirtyToSixty: Number(thirtyToSixty),
        sixtyToNinety: Number(sixtyToNinety),
        overNinety: Number(overNinety),
        totalOutstanding: Number(totalOutstanding)
      },
      taxSnapshot: {
        outputGST: Number(outputGST),
        inputITC: Number(inputGSTPurchases),
        netGSTPayable: netGSTPayable > 0 ? Number(netGSTPayable) : 0,
        itcCreditBalance: netGSTPayable < 0 ? Math.abs(Number(netGSTPayable)) : 0
      },
      cashFlowTrend
    };
  }
}


module.exports = ReportService;
