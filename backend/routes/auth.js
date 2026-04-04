const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, requestReset, verifyReset } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/request-reset', requestReset);
router.post('/verify-reset', verifyReset);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/switch-company/:companyId', authenticateToken, require('../controllers/authController').switchCompany);

module.exports = router;
