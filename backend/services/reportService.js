const { Invoice, Purchase, Expense, Customer, Supplier, Product, InvoiceItem, PurchaseItem, UserCompany, Subscription, Plan, sequelize } = require('../models');
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

  static async getDashboardSummary(companyId, user = null) {
    const today = new Date();
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      todaySales, monthlySales, pendingPayments, 
      monthlyExpenses, monthlyPurchases, invoicesCount, 
      productsCount, activeBusinessesCount
    ] = await Promise.all([
      Invoice.sum('total_amount', {
        where: {
          company_id: companyId,
          invoice_date: { [Op.gte]: startOfDay },
          status: { [Op.ne]: 'cancelled' }
        }
      }),
      Invoice.sum('total_amount', {
        where: {
          company_id: companyId,
          invoice_date: { [Op.between]: [startOfMonth, endOfMonth] },
          status: { [Op.ne]: 'cancelled' }
        }
      }),
      Invoice.sum('total_amount', {
        where: {
          company_id: companyId,
          payment_status: { [Op.in]: ['unpaid', 'partial'] }
        }
      }),
      Expense.sum('amount', {
        where: {
          company_id: companyId,
          date: { [Op.between]: [startOfMonth, endOfMonth] }
        }
      }),
      Purchase.sum('total_amount', {
        where: {
          company_id: companyId,
          bill_date: { [Op.between]: [startOfMonth, endOfMonth] },
          status: { [Op.ne]: 'cancelled' }
        }
      }),
      Invoice.count({
        where: {
          company_id: companyId,
          invoice_date: { [Op.between]: [startOfMonth, endOfMonth] },
          status: { [Op.ne]: 'cancelled' }
        }
      }),
      Product.count({
        where: { company_id: companyId }
      }),
      user ? UserCompany.count({ where: { user_id: user.id } }) : Promise.resolve(1)
    ]);

    // Get business limit from plan
    let totalBusinessesLimit = 1;
    if (user?.Company?.Subscription?.Plan) {
      let features = user.Company.Subscription.Plan.features || {};
      if (typeof features === 'string') {
        try { features = JSON.parse(features); } catch (e) { features = {}; }
      }
      totalBusinessesLimit = features.manage_businesses || 1;
    }

    const resTodaySales = Number(todaySales || 0);
    const resMonthlySales = Number(monthlySales || 0);
    const resPendingPayments = Number(pendingPayments || 0);
    const resMonthlyExpenses = Number(monthlyExpenses || 0);
    const resMonthlyPurchases = Number(monthlyPurchases || 0);

    const grossProfit = resMonthlySales - resMonthlyPurchases;
    const netProfit = grossProfit - resMonthlyExpenses;

    // Get sales data for chart (last 7 days)
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const daySales = await Invoice.sum('total_amount', {
        where: {
          company_id: companyId,
          invoice_date: { [Op.between]: [dayStart, dayEnd] },
          status: { [Op.ne]: 'cancelled' }
        }
      }) || 0;

      salesChartData.push({
        date: dayStart.toISOString().split('T')[0],
        sales: Number(daySales)
      });
    }

    return {
      todaySales: resTodaySales,
      monthlySales: resMonthlySales,
      pendingPayments: resPendingPayments,
      monthlyExpenses: resMonthlyExpenses,
      grossProfit,
      netProfit,
      salesChartData,
      invoicesCount,
      productsCount,
      activeBusinessesCount: activeBusinessesCount || 1,
      totalBusinessesLimit
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
}

module.exports = ReportService;
