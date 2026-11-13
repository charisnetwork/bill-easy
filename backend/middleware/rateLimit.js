/**
 * Rate limiting.
 *
 * Many customers reach us through one shared address (mobile carriers, an office router), so
 * limits that count failures are kept per email as well as per address: one person mistyping a
 * password must not lock out everyone else behind the same address.
 */

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = rateLimit;
const { logSecurityEvent } = require('../services/auditService');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const fromEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

// General API limit per address: a dashboard fires 5-8 calls per page and a shop may have
// several counters behind one address. Login, sign-up and password reset have their own limits.
const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: fromEnv('API_RATE_LIMIT', 2000),
  message: {
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMITED',
    retryAfter: 900
  },
  standardHeaders: true, // Sends RateLimit-* headers to client
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/health', // Don't rate-limit health checks
  handler: (req, res, next, options) => {
    console.warn(`[Rate Limit] Exceeded for ${req.ip} on ${req.path}`);
    require('../services/securityReporter').reportSecurityEvent('rate_limited', { ip: req.ip, path: req.path });
    res.status(options.statusCode).json(options.message);
  }
});

const authMessage = {
  error: 'Too many login attempts. Please try again after 15 minutes.',
  code: 'AUTH_RATE_LIMITED',
  retryAfter: 900
};
const authHandler = (req, res, next, options) => {
  console.warn(`[Auth Rate Limit] Exceeded for ${req.ip}`);
  require('../services/securityReporter').reportSecurityEvent('rate_limited', { severity: 'medium', ip: req.ip, path: req.path, detail: { limiter: 'login' } });
  res.status(options.statusCode).json(options.message);
};
const emailOf = (req) => String(req.body?.email || '').trim().toLowerCase();

// 5 failed attempts per email from one address...
const authPerEmail = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}|${emailOf(req)}`,
  message: authMessage,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authHandler
});
// ...and 50 failed attempts per address whatever the email, against guessing across accounts.
const authPerAddress = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 50,
  skipSuccessfulRequests: true,
  message: authMessage,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authHandler
});
const authLimiter = [authPerAddress, authPerEmail];

// New accounts per address per hour (only successful sign-ups count).
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: fromEnv('REGISTER_RATE_LIMIT', 10),
  skipFailedRequests: true,
  message: { error: 'Too many new accounts from this network. Please try again later.', code: 'REGISTER_RATE_LIMITED', retryAfter: 3600 },
  standardHeaders: true,
  legacyHeaders: false
});

// Emails we send on request (password reset, verification): these always answer 200, so every
// request counts. 3 per email and 30 per address per hour.
const emailMessage = { error: 'Too many requests. Please try again later.', code: 'RESET_RATE_LIMITED', retryAfter: 3600 };
const passwordResetLimiter = [
  rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: emailMessage, standardHeaders: true, legacyHeaders: false }),
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator: (req) => `${ipKeyGenerator(req.ip)}|${emailOf(req)}`,
    message: emailMessage,
    standardHeaders: true,
    legacyHeaders: false
  })
];

// Account-level brute force protection
// Tracks failed attempts per account (stored temporarily in memory)
// In production, use Redis for distributed tracking
const bruteForceAttempts = new Map();

const bruteForceProtection = async (req, res, next) => {
  const email = req.body?.email;
  // Anything but a string is rejected by validation next; it must not crash here.
  if (!email || typeof email !== 'string') return next();
  
  const key = email.toLowerCase();
  const attempts = bruteForceAttempts.get(key) || { count: 0, firstAttempt: Date.now() };
  
  // Check if account is locked
  if (attempts.count >= 10) {
    const lockDuration = 60 * 60 * 1000; // 1 hour
    const timeSinceFirstAttempt = Date.now() - attempts.firstAttempt;
    
    if (timeSinceFirstAttempt < lockDuration) {
      // Log security event
      await logSecurityEvent('BRUTE_FORCE_DETECTED', {
        email: key,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        attempts: attempts.count
      });
      
      return res.status(429).json({
        error: 'Account temporarily locked due to too many failed attempts',
        code: 'ACCOUNT_LOCKED',
        retryAfter: Math.ceil((lockDuration - timeSinceFirstAttempt) / 1000)
      });
    } else {
      // Reset counter after lock period
      bruteForceAttempts.delete(key);
    }
  }
  
  // Store attempts on request for increment on failure
  req.bruteForceKey = key;
  req.bruteForceAttempts = attempts;
  
  next();
};

// Increment brute force counter on failed login
const incrementBruteForce = (email) => {
  const key = email.toLowerCase();
  const existing = bruteForceAttempts.get(key);
  
  if (existing) {
    existing.count += 1;
    bruteForceAttempts.set(key, existing);
  } else {
    bruteForceAttempts.set(key, { count: 1, firstAttempt: Date.now() });
  }
  
  // Cleanup old entries periodically (entries older than 1 hour)
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [k, v] of bruteForceAttempts.entries()) {
    if (v.firstAttempt < oneHourAgo) {
      bruteForceAttempts.delete(k);
    }
  }
};

// Clear brute force counter on successful login
const clearBruteForce = (email) => {
  bruteForceAttempts.delete(email.toLowerCase());
};

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  bruteForceProtection,
  incrementBruteForce,
  clearBruteForce
};
