const charisOs = require('./charisOsService');

// Deny-by-default OS entitlements; OS outages surface as 503, never as "allowed".
const checkSubscriptionFeature = async (companyId, featureKey) =>
  charisOs.featureAllowed(await charisOs.getSnapshot(companyId), featureKey);

module.exports = {
  checkSubscriptionFeature
};
