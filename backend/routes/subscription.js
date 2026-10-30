const express = require('express');
const router = express.Router();
const os = require('../controllers/charisOsSubscriptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');

// Plans, coupons and payments are owned by Charis OS; these routes proxy its customer API.
router.get('/plans', os.getPlans);

router.use(authenticateToken);
router.use(companyContext);

router.get('/current', os.getCurrentSubscription);
router.get('/usage', os.getUsage);
router.post('/sync', requireRole('owner'), os.sync);
router.get('/checkout', requireRole('owner'), os.getCheckout);
router.post('/checkout/quote', requireRole('owner'), os.quote);
router.post('/checkout/orders', requireRole('owner'), os.createOrder);
router.post('/checkout/verify', requireRole('owner'), os.verify);

module.exports = router;
