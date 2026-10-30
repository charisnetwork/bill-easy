const charisOs = require('../services/charisOsService');

// Charis OS feature codes for paid report tiers.
const TIER_FEATURES = { PREMIUM: 'advanced_reports', ENTERPRISE: 'enterprise_reports' };

/**
 * Middleware to check if the company has access to a specific report tier.
 * @param {string} tier - FREE (everyone), PREMIUM (advanced_reports) or ENTERPRISE (enterprise_reports)
 */
const checkReportAccess = (tier) => {
  return async (req, res, next) => {
    try {
      if (tier === 'FREE') {
        return next(); // Free reports are available to all authenticated companies
      }

      const hasAccess = charisOs.featureAllowed(await charisOs.getSnapshot(req.companyId), TIER_FEATURES[tier]);

      if (!hasAccess) {
        return res.status(403).json({
          error: `Upgrade Required`,
          message: 'Your current plan does not include this report. Please upgrade your subscription to access it.'
        });
      }

      next();
    } catch (error) {
      if (error instanceof charisOs.CharisOsError) return res.status(error.status).json({ error: error.message, code: error.code });
      console.error(`[checkReportAccess] Error checking report access:`, error);
      res.status(500).json({ error: 'Failed to verify report access permissions' });
    }
  };
};

module.exports = checkReportAccess;
