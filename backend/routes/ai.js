const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, checkFeatureAccess } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');
const { consumeMonthlyUnit } = require('../services/usageLimits');

router.post('/chat', authenticateToken, companyContext, checkFeatureAccess('ai_assistant'), aiController.chatWithAssistant);
// Reading a bill with AI uses one AI message.
router.post('/process-pdf', authenticateToken, companyContext, checkFeatureAccess('ai_assistant'), consumeMonthlyUnit('ai_messages'), aiController.processPDFExtract);
router.get('/health', (req, res) => res.json({ status: 'ai service is up' }));

module.exports = router;
