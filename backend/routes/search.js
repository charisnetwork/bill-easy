const express = require('express');
const { Op } = require('sequelize');
const { Customer, Supplier, Product, Invoice, Quotation } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');

// Global search (Ctrl+K): a few matches of each kind, always inside the current business.
const router = express.Router();
router.use(authenticateToken);
router.use(companyContext);

const like = (text) => ({ [Op.iLike]: `%${text.replace(/[\\%_]/g, '\\$&')}%` });

router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  if (q.length < 2) return res.json({ customers: [], suppliers: [], products: [], invoices: [], quotations: [] });
  const company_id = req.companyId;
  const take = { limit: 5, order: [['updatedAt', 'DESC']] };
  try {
    const [customers, suppliers, products, invoices, quotations] = await Promise.all([
      Customer.findAll({ where: { company_id, [Op.or]: [{ name: like(q) }, { phone: like(q) }, { gst_number: like(q) }] }, attributes: ['id', 'name', 'phone'], ...take }),
      Supplier.findAll({ where: { company_id, [Op.or]: [{ name: like(q) }, { phone: like(q) }, { gst_number: like(q) }] }, attributes: ['id', 'name', 'phone'], ...take }),
      Product.findAll({ where: { company_id, [Op.or]: [{ name: like(q) }, { sku: like(q) }, { hsn_code: like(q) }] }, attributes: ['id', 'name', 'sku'], ...take }),
      Invoice.findAll({ where: { company_id, invoice_number: like(q) }, attributes: ['id', 'invoice_number', 'total_amount'], ...take }),
      Quotation.findAll({ where: { company_id, quotation_number: like(q) }, attributes: ['id', 'quotation_number', 'total_amount'], ...take }),
    ]);
    res.json({ customers, suppliers, products, invoices, quotations });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Search is unavailable right now' });
  }
});

module.exports = router;
