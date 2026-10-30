/**
 * Authentication Middleware - JWT Verification with Token Version Check
 * 
 * Features:
 * - JWT verification with proper validation
 * - Token version check (for mass logout)
 * - Session validation via refresh token lookup
 * - Proper error handling with specific error codes
 */

const jwt = require('jsonwebtoken');
const { User, Company, Subscription, Plan, RefreshToken } = require('../models');
const { checkSubscriptionFeature } = require('../services/subscriptionService');
const charisOs = require('../services/charisOsService');
const { logSecurityEvent, EVENT_TYPES, SEVERITY } = require('../services/auditService');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

/**
 * Main authentication middleware
 * Verifies JWT and loads user context
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Also check query parameters (for PDF downloads via window.open)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
        issuer: 'bill-easy-api',
        audience: 'bill-easy-client'
      });
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          expiredAt: jwtError.expiredAt
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
      throw jwtError;
    }

    // 3. Load user with company and subscription
    const user = await User.findByPk(decoded.sub, {
      include: [{ 
        model: Company, 
        include: [{ model: Subscription, include: [Plan] }] 
      }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Invalid or inactive user',
        code: 'USER_INVALID'
      });
    }

    // 4. Check token version (for mass logout)
    const userTokenVersion = user.token_version || 1;
    if (userTokenVersion !== decoded.ver) {
      await logSecurityEvent(EVENT_TYPES.UNAUTHORIZED_ACCESS, {
        userId: user.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { 
          reason: 'Token version mismatch - user logged out from all sessions',
          tokenVersion: decoded.ver,
          currentVersion: userTokenVersion
        },
        severity: SEVERITY.WARNING
      });
      
      return res.status(401).json({ 
        error: 'Token invalidated. Please login again.',
        code: 'TOKEN_VERSION_INVALID'
      });
    }

    // 5. Optional: Verify session is still valid (check if refresh token exists and not revoked)
    // This adds extra security but adds a DB query to every request
    // Uncomment if you want strict session validation
    /*
    const sessionValid = await RefreshToken.findOne({
      where: {
        session_id: decoded.sid,
        user_id: decoded.sub,
        revoked_at: null,
        expires_at: { [require('sequelize').Op.gt]: new Date() }
      }
    });
    
    if (!sessionValid) {
      return res.status(401).json({ 
        error: 'Session expired or revoked',
        code: 'SESSION_INVALID'
      });
    }
    */

    // 6. Charis OS operator restriction blocks the whole account.
    if (await charisOs.isRestricted(decoded.tid)) {
      return res.status(403).json({ error: charisOs.RESTRICTED_MESSAGE, code: 'ACCOUNT_RESTRICTED' });
    }
    charisOs.refreshProfile(decoded.tid);

    // 7. Attach user context to request
    req.user = user;
    req.companyId = decoded.tid;  // Tenant ID from token
    req.userRole = decoded.role;  // Role from token
    req.sessionId = decoded.sid;  // Session ID from token
    req.tokenJti = decoded.jti;   // Token unique ID

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-based access control middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logSecurityEvent(EVENT_TYPES.PERMISSION_DENIED, {
        userId: req.user.id,
        ip: req.ip,
        metadata: {
          requiredRoles: roles,
          userRole: req.user.role,
          path: req.path
        }
      });
      
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'ROLE_REQUIRED',
        required: roles
      });
    }
    next();
  };
};

/**
 * Permission-based access control middleware
 */
const checkPermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || {};
    if (req.user.role === 'owner' || userPermissions[permission]) {
      return next();
    }
    
    logSecurityEvent(EVENT_TYPES.PERMISSION_DENIED, {
      userId: req.user.id,
      ip: req.ip,
      metadata: {
        requiredPermission: permission,
        path: req.path
      }
    });
    
    return res.status(403).json({ 
      error: `Permission required: ${permission}`,
      code: 'PERMISSION_REQUIRED'
    });
  };
};

/**
 * Subscription quota check middleware
 */
const QUOTA_RESPONSES = {
  invoices: (limit, used) => ({ error: `Monthly invoice limit reached (${limit}). Upgrade your plan for more.`, limitCode: 'invoice.monthly', limit, used }),
  products: (limit, used) => ({ error: `Product limit reached (${limit}). Upgrade your plan for more.`, limitCode: 'product.total', limit, used }),
};

/** Limits come from the OS plan; usage is counted from this business's records. */
const checkCharisOsQuota = async (req, res, next, quotaType) => {
  try {
    const snapshot = await charisOs.getSnapshot(req.companyId);
    const limit = charisOs.limitFor(snapshot, quotaType);
    if (limit !== null) {
      const used = (await charisOs.usageFor(req.companyId))[quotaType];
      if (used >= limit) return res.status(403).json({ ...QUOTA_RESPONSES[quotaType](limit, used), code: 'QUOTA_EXCEEDED', upgradeRequired: true });
    }
    return next();
  } catch (error) {
    if (error instanceof charisOs.CharisOsError) return res.status(error.status).json({ error: error.message, code: error.code, upgradeRequired: error.status === 403 });
    return next(error);
  }
};

const checkSubscriptionQuota = (quotaType) => (req, res, next) => checkCharisOsQuota(req, res, next, quotaType);

/**
 * Feature access check middleware
 */
const checkFeatureAccess = (featureKey) => {
  return async (req, res, next) => {
    let hasAccess;
    try {
      hasAccess = await checkSubscriptionFeature(req.companyId, featureKey);
    } catch (error) {
      if (error instanceof charisOs.CharisOsError) return res.status(error.status).json({ error: error.message, code: error.code });
      return next(error);
    }

    if (hasAccess) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Your current plan does not include this feature. Please upgrade.',
      code: 'FEATURE_NOT_AVAILABLE',
      feature: featureKey,
      upgradeRequired: true
    });
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Used for endpoints that work for both authenticated and anonymous users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();  // Continue without user
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'bill-easy-api',
      audience: 'bill-easy-client'
    });

    const user = await User.findByPk(decoded.sub, {
      include: [{ 
        model: Company, 
        include: [{ model: Subscription, include: [Plan] }] 
      }]
    });

    if (user && user.is_active && (user.token_version || 1) === decoded.ver) {
      req.user = user;
      req.companyId = decoded.tid;
      req.userRole = decoded.role;
      req.sessionId = decoded.sid;
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

module.exports = { 
  authenticateToken, 
  requireRole, 
  checkPermission, 
  checkSubscriptionQuota, 
  checkFeatureAccess,
  optionalAuth
};
