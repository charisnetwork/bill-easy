const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  requestReset, 
  verifyReset,
  generateAndSendOTP,
  verifyOTP,
  sendResetLink,
  resetPassword,
  resetPasswordWithOTP
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

// Authentication Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Legacy Password Reset Routes (keep for backward compatibility)
router.post('/request-reset', requestReset);
router.post('/verify-reset', verifyReset);

// New OTP-based Password Reset Routes
router.post('/send-otp', generateAndSendOTP);           // Send OTP to email
router.post('/verify-otp', verifyOTP);                  // Verify OTP
router.post('/reset-password', resetPassword);          // Reset with JWT token
router.post('/reset-password-otp', resetPasswordWithOTP); // Reset with OTP token

// New Reset Link Route
router.post('/send-reset-link', sendResetLink);         // Send reset link via email

// Profile Routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/switch-company/:companyId', authenticateToken, require('../controllers/authController').switchCompany);

module.exports = router;
