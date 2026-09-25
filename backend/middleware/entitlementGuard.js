const { CharisSDK } = require('@charis/sdk');
const SubscriptionGuard = require('../utils/subscriptionGuard');
const { checkSubscriptionFeature } = require('../services/subscriptionService');

/**
 * Middleware factory to check if a feature is enabled for the tenant.
 * Tries CharisSDK first, falls back to local check if unavailable.
 *
 * @param {string} featureCode 
 * @returns {import('express').RequestHandler}
 */
const requireFeature = (featureCode) => {
  return async (req, res, next) => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        return res.status(400).json({ error: 'Company context required for feature checks' });
      }

      let hasAccess = false;
      let fromCharis = false;

      // 1. Try CharisSDK Control Centre
      try {
        if (CharisSDK && CharisSDK.entitlements) {
          const entitlement = await CharisSDK.entitlements.getEntitlement(companyId);
          if (entitlement && Array.isArray(entitlement.features)) {
            hasAccess = entitlement.features.includes(featureCode);
            fromCharis = true;
          }
        }
      } catch (err) {
        console.warn(`[entitlementGuard] CharisSDK error, falling back to local for feature ${featureCode}:`, err.message);
      }

      // 2. Fall back to local check
      if (!fromCharis) {
        hasAccess = await checkSubscriptionFeature(companyId, featureCode);
      }

      if (hasAccess) {
        return next();
      }

      const planName = req.user?.Company?.Subscription?.Plan?.plan_name || 'Free';
      return res.status(403).json({ 
        error: `Your current plan (${planName}) does not include access to this feature. Please upgrade.`,
        code: 'FEATURE_NOT_AVAILABLE',
        feature: featureCode,
        upgradeRequired: true
      });
    } catch (error) {
      console.error('[entitlementGuard] requireFeature error:', error);
      return res.status(500).json({ error: 'Internal server error during feature validation' });
    }
  };
};

/**
 * Middleware factory to check if tenant has a specific plan or higher.
 *
 * @param {string} planName 
 * @returns {import('express').RequestHandler}
 */
const requirePlan = (planName) => {
  return async (req, res, next) => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        return res.status(400).json({ error: 'Company context required for plan checks' });
      }

      const planHierarchy = { 'Free': 0, 'Basic': 1, 'Premium': 2, 'Enterprise': 3 };
      const requiredLevel = planHierarchy[planName] || 0;
      
      let hasPlan = false;
      let fromCharis = false;

      // 1. Try CharisSDK Control Centre
      try {
        if (CharisSDK && CharisSDK.entitlements) {
          const entitlement = await CharisSDK.entitlements.getEntitlement(companyId);
          if (entitlement && entitlement.planId) {
            const currentLevel = planHierarchy[entitlement.planId] || 0;
            hasPlan = currentLevel >= requiredLevel;
            fromCharis = true;
          }
        }
      } catch (err) {
        console.warn(`[entitlementGuard] CharisSDK error, falling back to local for plan ${planName}:`, err.message);
      }

      // 2. Fall back to local check
      if (!fromCharis) {
        const userPlan = req.user?.Company?.Subscription?.Plan?.plan_name || 'Free';
        const currentLevel = planHierarchy[userPlan] || 0;
        hasPlan = currentLevel >= requiredLevel;
      }

      if (hasPlan) {
        return next();
      }

      const currentPlan = req.user?.Company?.Subscription?.Plan?.plan_name || 'Free';
      return res.status(403).json({
        error: `Your current plan (${currentPlan}) does not meet the minimum required plan (${planName}). Please upgrade.`,
        code: 'PLAN_UPGRADE_REQUIRED',
        requiredPlan: planName,
        upgradeRequired: true
      });
    } catch (error) {
      console.error('[entitlementGuard] requirePlan error:', error);
      return res.status(500).json({ error: 'Internal server error during plan validation' });
    }
  };
};

/**
 * Middleware factory to check quota limits.
 *
 * @param {string} quotaType (e.g. 'invoice.monthly', 'product.total')
 * @param {Function|number} getAmount 
 * @returns {import('express').RequestHandler}
 */
const checkQuota = (quotaType, getAmount = () => 1) => {
  return async (req, res, next) => {
    try {
      const companyId = req.companyId;
      if (!companyId) {
        return res.status(400).json({ error: 'Company context required for quota checks' });
      }
      
      let hasQuota = false;
      let fromCharis = false;

      // Attempt to check SDK if they provide usage/limits context
      try {
        if (CharisSDK && CharisSDK.entitlements) {
          // Verify SDK is reachable
          await CharisSDK.entitlements.getEntitlement(companyId);
          // Assuming CharisSDK manages limits validation via SDK middleware locally if requested
          // For now, if we reach this point without throwing, we might still fallback to local usage metrics
        }
      } catch (err) {
        console.warn(`[entitlementGuard] CharisSDK error, falling back to local for quota ${quotaType}:`, err.message);
      }

      // Map quotaType to SubscriptionGuard actionType
      const quotaActionMap = {
        'invoice.monthly': 'CREATE_INVOICE',
        'product.total': 'ADD_PRODUCT',
        'ewaybill.monthly': 'EWAY_BILL'
      };
      const actionType = quotaActionMap[quotaType] || quotaType.toUpperCase().replace('.', '_');

      // 2. Fall back to local usage tracking
      hasQuota = await SubscriptionGuard.canPerformAction(companyId, actionType);

      if (hasQuota) {
        return next();
      }

      const planName = req.user?.Company?.Subscription?.Plan?.plan_name || 'Free';
      return res.status(403).json({
        error: `Your current plan (${planName}) has exceeded the quota for this action. Please upgrade.`,
        code: 'QUOTA_EXCEEDED',
        quota: quotaType,
        upgradeRequired: true
      });
    } catch (error) {
      console.error('[entitlementGuard] checkQuota error:', error);
      return res.status(500).json({ error: 'Internal server error during quota validation' });
    }
  };
};

module.exports = {
  requireFeature,
  requirePlan,
  checkQuota
};
