const express = require('express');
const router = express.Router();
const { 
  getPurchases, getPurchase, createPurchase, 
  updatePurchase, deletePurchase, recordPayment,
  parsePurchasePDF 
} = require('../controllers/purchaseController');
const { authenticateToken } = require('../middleware/auth');
const { uploadPurchaseFile } = require('../services/uploadService');
const companyContext = require('../middleware/companyContext');
const { requireRecordLimit } = require('../services/usageLimits');

router.use(authenticateToken);
router.use(companyContext);

router.get('/', getPurchases);
router.get('/:id', getPurchase);
router.post('/', requireRecordLimit('purchase_bills'), createPurchase);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);
router.post('/:id/payment', recordPayment);
router.post('/parse-pdf', requireRecordLimit('purchase_bills'), uploadPurchaseFile.single('file'), parsePurchasePDF);

module.exports = router;
