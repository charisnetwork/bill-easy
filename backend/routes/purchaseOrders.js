const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authenticateToken } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');
const { requireFeature } = require('../services/usageLimits');

router.use(authenticateToken);
router.use(companyContext);
router.use(requireFeature('purchase_orders'));

router.get('/', purchaseOrderController.getPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrder);
router.get('/:id/pdf', purchaseOrderController.downloadPdf);
router.post('/', purchaseOrderController.createPurchaseOrder);
router.put('/:id', purchaseOrderController.updatePurchaseOrder);
router.delete('/:id', purchaseOrderController.deletePurchaseOrder);

module.exports = router;
