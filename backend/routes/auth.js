const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const { 
  register, 
  login, 
  refreshToken,
  logout,
  logoutAll,
  getProfile, 
  updateProfile, 
  changePassword,
  switchCompany,
  getSessions,
  revokeSession,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
  deleteAccount,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  registerValidation, 
  loginValidation 
} = require('../middleware/validation');
const { 
  authLimiter, 
  registerLimiter,
  passwordResetLimiter,
  bruteForceProtection 
} = require('../middleware/rateLimit');

// Cookie parser for refresh token handling
router.use(cookieParser());

/* ===============================
   PUBLIC ROUTES
================================ */

// Register - limited number of new accounts per address
router.post('/register', registerLimiter, registerValidation, register);

// Login - strict rate limit + brute force protection
router.post('/login', 
  authLimiter,         // 5 failed attempts per email, 50 per address, per 15 min
  bruteForceProtection, // Account-level lockout after 10 failures
  loginValidation, 
  login
);

// Refresh token - requires HttpOnly cookie
router.post('/refresh', refreshToken);

// Email Verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', passwordResetLimiter, resendVerification);

// Password Reset
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

/* ===============================
   PROTECTED ROUTES
================================ */

// Logout - revoke refresh token
router.post('/logout', authenticateToken, logout);

// Logout all sessions except current
router.post('/logout-all', authenticateToken, logoutAll);

// Get profile
router.get('/profile', authenticateToken, getProfile);

// Update profile
router.put('/profile', authenticateToken, updateProfile);

// Change password
router.post('/change-password', authenticateToken, changePassword);

// Delete the account and every business it owns (Google Play and DPDP requirement)
const deletionLimiter = require('express-rate-limit').rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Please wait 15 minutes.' } });
router.post('/delete-account', deletionLimiter, authenticateToken, deleteAccount);

// Switch company
router.post('/switch-company/:companyId', authenticateToken, switchCompany);

// Get active sessions
router.get('/sessions', authenticateToken, getSessions);

// Revoke specific session
router.post('/sessions/:sessionId/revoke', authenticateToken, revokeSession);

module.exports = router;
