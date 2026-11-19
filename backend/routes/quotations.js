const express = require('express');
const router = express.Router();
const {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  downloadQuotationPdf
} = require('../controllers/quotationController');
const { authenticateToken } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');
const { requireFeature } = require('../services/usageLimits');

router.use(authenticateToken);
router.use(companyContext);
// Quotations are a paid feature; quotations made earlier stay viewable after a downgrade.
const quotationFeature = requireFeature('quotations');
router.use((req, res, next) => (req.method === 'GET' ? next() : quotationFeature(req, res, next)));

router.get('/', getQuotations);
router.get('/next-number', require('../controllers/quotationController').getNextQuotationNumber);
router.get('/:id', getQuotation);
router.get('/:id/pdf', downloadQuotationPdf);
router.post('/', createQuotation);
router.put('/:id', updateQuotation);
router.delete('/:id', deleteQuotation);

module.exports = router;
