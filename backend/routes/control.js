const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { ControlSummaryError, controlSummaryConfig, getSummary, listCustomers, parseCustomerQuery, parseRange, summaryTokenMatches } = require('../services/controlSummary');

// Charis OS → Bill Easy read-only reporting. Hidden (404) unless CHARIS_OS_SUMMARY_TOKEN is set.
const router = express.Router();
router.use(rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests' } }));
router.use((req, res, next) => {
  const config = controlSummaryConfig();
  if (!config) return res.status(404).json({ error: 'Not found' });
  if (!summaryTokenMatches(req.get('authorization'), config.token)) return res.status(401).json({ error: 'Invalid control credential' });
  res.set('Cache-Control', 'private, no-store');
  return next();
});
const handle = (action) => async (req, res) => {
  try { res.json(await action(req)); } catch (error) {
    if (error instanceof ControlSummaryError) return res.status(error.status).json({ error: error.message });
    console.error('Control summary failed:', error.message);
    return res.status(503).json({ error: 'Summary is temporarily unavailable' });
  }
};
router.get('/summary', handle((req) => getSummary(parseRange(req.query))));
router.get('/customers', handle((req) => listCustomers(parseCustomerQuery(req.query))));

module.exports = router;
