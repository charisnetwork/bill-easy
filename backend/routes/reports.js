const express = require('express');
const router = express.Router();
const {
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
  getTDSTCS,
  sendToCA,
  downloadGSTR1
} = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');
const checkReportAccess = require('../middleware/reportAccess');

router.use(authenticateToken);
router.use(companyContext);

router.get('/dashboard', getDashboard); // Dashboard has its own logic

// --- FREE TIER REPORTS ---
router.get('/sales', checkReportAccess('FREE'), getSalesReport);
router.get('/purchases', checkReportAccess('FREE'), getPurchaseReport);
router.get('/expenses', checkReportAccess('FREE'), getExpenseReport); // Category and Transaction can use this for now
router.get('/customer-outstanding', checkReportAccess('FREE'), getCustomerOutstanding);
router.get('/supplier-outstanding', checkReportAccess('FREE'), getSupplierOutstanding);
router.get('/stock', checkReportAccess('FREE'), getStockReport);

// --- PREMIUM TIER REPORTS ---
router.get('/profit-loss', checkReportAccess('PREMIUM'), getProfitLossReport);
router.get('/gst', checkReportAccess('PREMIUM'), getGSTReport);
router.get('/daybook', checkReportAccess('PREMIUM'), getDaybook);
router.get('/cash-bank', checkReportAccess('PREMIUM'), getCashAndBankReport);
router.get('/gst-sales', checkReportAccess('PREMIUM'), getGSTSales);
router.get('/gst-purchase', checkReportAccess('PREMIUM'), getGSTPurchase);
router.get('/hsn-sales', checkReportAccess('PREMIUM'), getHSNWiseSales);
router.get('/bill-profit', checkReportAccess('PREMIUM'), getBillWiseProfit);

// --- ENTERPRISE TIER REPORTS ---
router.get('/balance-sheet', checkReportAccess('ENTERPRISE'), getBalanceSheet);
router.get('/gstr-1', checkReportAccess('ENTERPRISE'), getGSTSales); // GSTR-1 logic
router.get('/gstr-1/download', checkReportAccess('ENTERPRISE'), downloadGSTR1);
router.get('/gstr-2', checkReportAccess('ENTERPRISE'), getGSTPurchase); // GSTR-2 logic
router.get('/gstr-3b', checkReportAccess('ENTERPRISE'), getGSTR3b);
router.get('/tds-tcs', checkReportAccess('ENTERPRISE'), getTDSTCS);
router.post('/send-to-ca', checkReportAccess('ENTERPRISE'), sendToCA);

module.exports = router;
