const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const companyContext = require('../middleware/companyContext');
const {
  getRecurringSubscriptions,
  getRecurringSubscriptionById,
  createRecurringSubscription,
  updateRecurringSubscription,
  toggleStatus,
  triggerNow,
  deleteRecurringSubscription
} = require('../controllers/recurringController');

router.use(authenticateToken);
router.use(companyContext);

router.get('/', getRecurringSubscriptions);
router.get('/:id', getRecurringSubscriptionById);
router.post('/', createRecurringSubscription);
router.put('/:id', updateRecurringSubscription);
router.patch('/:id/status', toggleStatus);
router.post('/:id/trigger', triggerNow);
router.delete('/:id', deleteRecurringSubscription);

module.exports = router;
