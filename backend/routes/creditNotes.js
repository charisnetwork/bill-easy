const { refuseBadLineItems } = require('../services/lineItemRules');
const express = require('express');
const router = express.Router();
const { getCreditNotes, createCreditNote } = require('../controllers/creditNoteController');
const { authenticateToken } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');

router.use(authenticateToken);
router.use(companyContext);

router.get('/', getCreditNotes);
router.get('/:id/pdf', require('../controllers/creditNoteController').downloadCreditNotePdf);
router.post('/', refuseBadLineItems, createCreditNote);

module.exports = router;
