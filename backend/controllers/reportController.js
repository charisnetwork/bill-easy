const ReportService = require('../services/reportService');
const { generateGstr1Excel } = require('../services/gstr1Service');
const { sendEmailViaAPI } = require('../utils/mailer');
const { Invoice, Customer, InvoiceItem, Product, Company } = require('../models');
const { Op } = require('sequelize');

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

const sendToCA = async (req, res) => {
  try {
    const { caEmail, startDate, endDate } = req.body;
    if (!caEmail || !startDate || !endDate) {
      return res.status(400).json({ error: 'CA Email, start date, and end date are required' });
    }

    const company = await Company.findByPk(req.companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const invoices = await Invoice.findAll({
      where: {
        company_id: req.companyId,
        invoice_date: { [Op.between]: [new Date(startDate), new Date(endDate)] },
        status: { [Op.ne]: 'cancelled' }
      },
      include: [
        { model: Customer },
        { model: InvoiceItem, as: 'items', include: [Product] }
      ]
    });

    if (invoices.length === 0) {
      return res.status(400).json({ error: 'No invoices found for the selected period' });
    }

    const meta = {
      companyName: company.name,
      gstin: company.gst_number || '',
      period: \`\${new Date(startDate).toLocaleDateString()} to \${new Date(endDate).toLocaleDateString()}\`
    };

    const excelBuffer = await generateGstr1Excel(invoices, meta);
    
    // Attach the Excel file as base64
    const base64Content = excelBuffer.toString('base64');
    const attachment = {
      content: base64Content,
      name: \`GSTR1_\${company.name.replace(/\\s+/g, '_')}_\${startDate}_\${endDate}.xlsx\`
    };

    const subject = \`GSTR-1 Report: \${company.name}\`;
    const textContent = \`Hello,\\n\\nPlease find attached the GSTR-1 Excel report for \${company.name} for the period \${meta.period}.\\n\\nRegards,\\nBillEasy System\`;
    const htmlContent = \`
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">GSTR-1 Report</h2>
        <p>Hello,</p>
        <p>Please find attached the GSTR-1 Excel report for <strong>\${company.name}</strong> for the period \${meta.period}.</p>
        <p>Regards,<br>BillEasy System</p>
      </div>
    \`;

    // Manually call the Brevo API object if sendEmailViaAPI doesn't directly support attachments via our abstraction,
    // but the abstraction passes along the full object. We need to tweak mailer.js if it doesn't support attachments, 
    // or just inject it directly using the sendEmailViaAPI function. Let's see if we can pass attachments.
    // Actually, mailer.js only checks for to, subject, textContent, htmlContent, replyTo.
    // Let's modify mailer.js slightly first, or use a workaround. Wait, I will just call sendEmailViaAPI but I need to ensure it accepts attachments.
    // I'll update mailer.js to support 'attachments'.
    
    await sendEmailViaAPI({
      to: caEmail,
      subject,
      textContent,
      htmlContent,
      attachments: [attachment]
    });

    res.json({ message: 'GSTR-1 report sent to CA successfully' });
  } catch (error) {
    console.error('Send to CA Error:', error);
    res.status(500).json({ error: 'Failed to send GSTR-1 to CA' });
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
  getTDSTCS,
  sendToCA
};
