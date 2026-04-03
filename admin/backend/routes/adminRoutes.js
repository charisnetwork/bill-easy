const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const managementController = require('../controllers/managementController');

// Developer-only simple auth middleware
const authMiddleware = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret === process.env.ADMIN_SECRET) {
    return next();
  }
  return res.status(403).json({ error: "Unauthorized access" });
};

router.use(authMiddleware);

// Dashboard & Analytics
router.get('/dashboard/summary', analyticsController.getSummary);
router.get('/dashboard/revenue', analyticsController.getRevenueAnalytics);
router.get('/dashboard/subscribers', analyticsController.getSubscribers);

// Coupon Management
router.get('/coupons', managementController.getCoupons);
router.post('/coupons', managementController.createCoupon);
router.put('/coupons/:id', managementController.updateCoupon);
router.delete('/coupons/:id', managementController.deleteCoupon);

// Affiliate Management
router.get('/affiliates', managementController.getAffiliates);
router.post('/affiliates', managementController.createAffiliate);
router.delete('/affiliates/:id', managementController.deleteAffiliate);

// Coupon Detailed Analytics
router.get('/coupons/:id/analytics', analyticsController.getCouponAnalytics);

// Plan & Feature Management
router.get('/plans', managementController.getPlans);
router.patch('/plans/update', managementController.updatePlanFeature);
router.patch('/plans/:id', managementController.updatePlan);

module.exports = router;
