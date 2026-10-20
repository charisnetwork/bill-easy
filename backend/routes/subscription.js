const express = require('express');
const router = express.Router();
const { getPlans, getCurrentSubscription, upgradePlan, cancelSubscription, getUsage, processPayment, validateCoupon } = require('../controllers/subscriptionController');
const os = require('../controllers/charisOsSubscriptionController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');
const charisOs = require('../services/charisOsService');

// CHARIS_SUBSCRIPTION_MODE is fixed at startup; OS mode replaces the local plan/payment flow.
const managed = charisOs.enabled();

router.get('/plans', managed ? os.getPlans : getPlans);

router.use(authenticateToken);
router.use(companyContext);

router.get('/current', managed ? os.getCurrentSubscription : getCurrentSubscription);
router.get('/usage', managed ? os.getUsage : getUsage);
router.post('/upgrade', requireRole('owner'), managed ? os.managedElsewhere : upgradePlan);
router.post('/cancel', requireRole('owner'), managed ? os.managedElsewhere : cancelSubscription);
router.post('/payment', requireRole('owner'), managed ? os.managedElsewhere : processPayment);
router.post('/validate-coupon', requireRole('owner'), managed ? os.managedElsewhere : validateCoupon);

if (managed) {
  router.post('/sync', requireRole('owner'), os.sync);
  router.get('/checkout', requireRole('owner'), os.getCheckout);
  router.post('/checkout/quote', requireRole('owner'), os.quote);
  router.post('/checkout/orders', requireRole('owner'), os.createOrder);
  router.post('/checkout/verify', requireRole('owner'), os.verify);
}

module.exports = router;
