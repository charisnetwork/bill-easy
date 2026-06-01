const ReportService = require('../services/reportService');

const getDashboard = async (req, res) => {
  try {
    const summary = await ReportService.getDashboardSummary(req.companyId, req.user);
    res.json(summary);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const report = await ReportService.getSalesReport(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get sales report' });
  }
};

const getPurchaseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const report = await ReportService.getPurchaseReport(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get purchase report' });
  }
};

const getExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const report = await ReportService.getExpenseReport(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get expense report' });
  }
};

const getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const report = await ReportService.getProfitLossReport(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get P&L report' });
  }
};

const getGSTReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const report = await ReportService.getGSTReport(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get GST report' });
  }
};

const getCustomerOutstanding = async (req, res) => {
  try {
    const report = await ReportService.getCustomerOutstanding(req.companyId);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get customer outstanding' });
  }
};

const getSupplierOutstanding = async (req, res) => {
  try {
    const report = await ReportService.getSupplierOutstanding(req.companyId);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get supplier outstanding' });
  }
};

const getStockReport = async (req, res) => {
  try {
    const report = await ReportService.getStockReport(req.companyId);
    res.json(report);
  } catch (error) {
    // Error logged
    res.status(500).json({ error: 'Failed to get stock report' });
  }
};

const getDaybook = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getDaybook(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get daybook' });
  }
};

const getCashAndBankReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getCashAndBankReport(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cash and bank report' });
  }
};

const getGSTSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getGSTSales(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get GST Sales' });
  }
};

const getGSTPurchase = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getGSTPurchase(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get GST Purchase' });
  }
};

const getHSNWiseSales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getHSNWiseSales(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get HSN wise sales' });
  }
};

const getBillWiseProfit = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getBillWiseProfit(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get bill wise profit' });
  }
};

const getBalanceSheet = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getBalanceSheet(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get balance sheet' });
  }
};

const getGSTR3b = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getGSTR3b(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get GSTR3b' });
  }
};

const getTDSTCS = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start date and end date are required' });
    const report = await ReportService.getTDSTCS(req.companyId, startDate, endDate);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get TDS TCS' });
  }
};

module.exports = {
  getDashboard,
  getSalesReport,
  getPurchaseReport,
  getExpenseReport,
  getProfitLossReport,
  getGSTReport,
  getCustomerOutstanding,
  getSupplierOutstanding,
  getStockReport,
  getDaybook,
  getCashAndBankReport,
  getGSTSales,
  getGSTPurchase,
  getHSNWiseSales,
  getBillWiseProfit,
  getBalanceSheet,
  getGSTR3b,
  getTDSTCS
};
