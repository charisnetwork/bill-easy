const express = require('express');
const router = express.Router();
const staff = require('../controllers/staffController');
const { authenticateToken, requireRole, checkFeatureAccess } = require('../middleware/auth');
const { requireRecordLimit } = require('../services/usageLimits');
const companyContext = require('../middleware/companyContext');

// Staff & attendance is an Enterprise feature; within it the controller checks each person's
// permissions (owner/admin, or a staff login with staff_view / attendance_mark / payroll_view).
router.use(authenticateToken);
router.use(companyContext);
router.use(checkFeatureAccess('staff_attendance_payroll'));

const admins = requireRole('owner', 'admin');

router.get('/attendance', staff.getDayAttendance);
router.put('/attendance', staff.saveAttendance);
router.get('/payroll', staff.getPayroll);
router.get('/payroll/export', staff.exportPayroll);
router.get('/payments', staff.getPayments);
router.post('/payments', admins, staff.addPayment);

router.get('/', staff.getStaff);
router.post('/', admins, requireRecordLimit('staff_members', { unlistedIsUnlimited: true }), staff.addStaff);
router.put('/:id', admins, staff.updateStaff);
router.delete('/:id', admins, staff.removeStaff);
router.get('/:id/attendance', staff.getMonthAttendance);

module.exports = router;
