const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, checkFeatureAccess } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');

router.post('/chat', authenticateToken, companyContext, checkFeatureAccess('ai_assistant'), aiController.chatWithAssistant);
// Reading a bill with AI uses one AI message (taken and refunded by the controller).
router.post('/process-pdf', authenticateToken, companyContext, checkFeatureAccess('ai_assistant'), aiController.processPDFExtract);
router.get('/health', (req, res) => res.json({ status: 'ai service is up' }));

module.exports = router;
