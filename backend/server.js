require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const path = require('path');

const { rateLimit } = require('express-rate-limit');

const { sequelize, Company, Godown, User, UserCompany } = require('./models');
const { ensureDefaultGodown } = require('./services/companySetup');

// Routes
const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/company');
const customerRoutes = require('./routes/customers');
const supplierRoutes = require('./routes/suppliers');
const productRoutes = require("./routes/products");
const invoiceRoutes = require("./routes/invoices");
const quotationRoutes = require("./routes/quotations");
const purchaseRoutes = require("./routes/purchases");
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const expenseRoutes = require('./routes/expenses');
const reportRoutes = require('./routes/reports');
const subscriptionRoutes = require('./routes/subscription');
const ewayBillRoutes = require('./routes/ewayBills');
const creditNoteRoutes = require('./routes/creditNotes');
const aiRoutes = require('./routes/ai');
const enquiryRoutes = require('./routes/enquiry');
const paymentRoutes = require('./routes/payments');

const app = express();

// Trust proxy for express-rate-limit
app.set('trust proxy', 1);

/* =========================================
   SECURITY
========================================= */

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

/* =========================================
   CORS CONFIGURATION
   Vercel Frontend + Railway Backend Setup
========================================= */

// Default allowed origins
const ALLOWED_ORIGINS = [
  // Production custom domain
  'https://charisbilleasy.store',
  'https://www.charisbilleasy.store',
  // Local development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  // Capacitor Android app (native WebView origin)
  'capacitor://localhost',
  'https://localhost',          // Android WebView uses this if androidScheme is https
  'http://localhost',           // Android WebView uses this for capacitor:// scheme
  'ionic://localhost'           // Ionic compatibility
];

// Add FRONTEND_URL or ALLOWED_ORIGINS from env (comma-separated for multiple origins)
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  ALLOWED_ORIGINS.push(...envOrigins);
}
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  ALLOWED_ORIGINS.push(...envOrigins);
}


// Helper to check if origin matches allowed patterns
const isOriginAllowed = (origin) => {
  // Server-to-server / curl / mobile app requests have no origin — allow them
  if (!origin) return true;

  // Exact match against our curated whitelist
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  // Deny everything else
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id'],
    credentials: true
  })
);

/* =========================================
   REQUEST LOGGER
========================================= */

// Use 'combined' (Apache-style) in production for structured logging;
// use 'dev' locally for colourized output
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* =========================================
   RATE LIMITING
========================================= */

const { apiLimiter } = require('./middleware/rateLimit');

// Apply general API rate limiting (excludes auth routes which have their own)
app.use('/api/', apiLimiter);

/* =========================================
   BODY PARSER
========================================= */

// Webhook route specifically needs raw buffer for HMAC validation
app.use('/api/webhooks/charis', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================================
   HEALTH CHECK
========================================= */

// Health check (both /api/health and /health) - MUST return 200 for Railway
// Returns 'starting' while DB bootstrap is still running, 'ok' once ready.
let serverReady = false;

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: serverReady ? 'ok' : 'starting',
    timestamp: new Date().toISOString(),
    service: 'main-backend'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: serverReady ? 'ok' : 'starting',
    timestamp: new Date().toISOString(),
    service: 'main-backend'
  });
});

/* =========================================
   API ROUTES
========================================= */

// Standard /api/* routes (for Vercel proxy)
// Every record id is a UUID. Anything else can match no record, so answer 404 before it reaches the database.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidIds = (router) => router.param('id', (req, res, next, id) => (UUID.test(id) ? next() : res.status(404).json({ error: 'Not found' })));
app.use('/api/auth', authRoutes);
app.use('/api/company', uuidIds(companyRoutes));
app.use('/api/customers', uuidIds(customerRoutes));
app.use('/api/suppliers', uuidIds(supplierRoutes));
app.use("/api/products", uuidIds(productRoutes));
app.use("/api/invoices", uuidIds(invoiceRoutes));
app.use("/api/quotations", uuidIds(quotationRoutes));
app.use("/api/purchases", uuidIds(purchaseRoutes));
app.use("/api/purchase-orders", uuidIds(purchaseOrderRoutes));
app.use("/api/expenses", uuidIds(expenseRoutes));
app.use('/api/payments', uuidIds(paymentRoutes));
app.use('/api/reports', uuidIds(reportRoutes));
app.use('/api/subscription', uuidIds(subscriptionRoutes));
app.use('/api/eway-bills', uuidIds(ewayBillRoutes));
app.use('/api/credit-notes', uuidIds(creditNoteRoutes));
app.use('/api/ai', uuidIds(aiRoutes));
app.use('/api/recurring', uuidIds(require('./routes/recurring')));
app.use('/api/enquiries', uuidIds(enquiryRoutes));
app.use('/api/staff', uuidIds(require('./routes/staff')));
app.use("/api/utilities", require("./routes/utilities"));
// Server-to-server Control Centre integration. Every endpoint enforces its own API key.

// NOTE: Bare-path duplicate routes removed — Railway now correctly preserves /api/ prefix.
// All API calls must go through /api/* routes above.

// Only company assets (logo, signature, QR) are web-reachable, by unguessable name.
// Everything else under UPLOAD_ROOT (e.g. temp files) is never served.
const { PUBLIC_DIR, UPLOAD_ROOT, ensureLocalAsset, storageConfig } = require('./utils/fileStore');
storageConfig();
app.use(`/uploads/${PUBLIC_DIR}`, async (req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Content-Security-Policy', "default-src 'none'");
  // With R2, a file missing after a redeploy is fetched back from the bucket first.
  try { await ensureLocalAsset(`${PUBLIC_DIR}${decodeURIComponent(req.path)}`); } catch { /* the static handler answers 404 */ }
  next();
}, express.static(path.join(UPLOAD_ROOT, PUBLIC_DIR), { index: false, dotfiles: 'deny', fallthrough: false, redirect: false }));

/* =========================================
   ROOT ENDPOINT
========================================= */

// Root endpoint for basic health check
app.get('/', (req, res) => {
  res.json({
    message: "Bill Easy Backend is running.",
    port: process.env.PORT || 8001,
    status: "active"
  });
});

// API info endpoint (both /api and direct)
app.get('/api', (req, res) => {
  res.json({
    name: 'Bill Easy API',
    version: '1.0.0'
  });
});

app.get('/api-info', (req, res) => {
  res.json({
    name: 'Bill Easy API',
    version: '1.0.0'
  });
});

/* =========================================
   CHARIS OS (plans, coupons, payments)
========================================= */

// Charis OS owns plans, coupons and Razorpay; Bill Easy only enforces entitlements.
try {
  require('./services/charisOsService').charisOsConfig();
  console.log('[CharisOS] ✅ Plans, coupons and payments are managed by Charis OS');
} catch (err) {
  console.error(`❌ FATAL: ${err.message}. Bill Easy needs Charis OS to enforce plans. Exiting.`);
  process.exit(1);
}

/* =========================================
   ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {
  // Return proper 403 for CORS violations — do NOT bypass them
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy: Origin not allowed',
      code: 'CORS_REJECTED'
    });
  }

  // Log server-side errors (5xx) but not client errors (4xx)
  if (!err.status || err.status >= 500) {
    console.error('[Server Error]', err.message, err.stack?.split('\n')[1]?.trim());
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? (err.status < 500 ? err.message : 'Internal server error')
      : err.message
  });
});

/* =========================================
   404 HANDLER
========================================= */

// 404 handler for unmatched routes
app.use((req, res) => {
  // 404 - Route not found
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method
  });
});

/* =========================================
   SERVER START
========================================= */

const PORT = process.env.PORT || 8001;

// Startup secret validation — fail fast if critical secrets are missing
if (!process.env.JWT_SECRET && !process.env.JWT_ACCESS_SECRET) {
  console.error('❌ FATAL: JWT_SECRET or JWT_ACCESS_SECRET must be set. Exiting.');
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// ✅ START LISTENING IMMEDIATELY so Railway/load-balancer health checks pass
// and users are never hit with 504 during cold start.
// All DB bootstrap work runs in the background after the server is already up.
const server = app.listen(PORT, '0.0.0.0', () => {
  require('./services/charisOsService').publishFeatureCatalog();
  console.log(`🚀 Server listening on port ${PORT} — running DB bootstrap in background...`);
  startKeepAlive();
});

/* =========================================
   GRACEFUL SHUTDOWN
   Cleanly close HTTP server, DB pool, and
   background tasks on SIGTERM/SIGINT.
========================================= */

const gracefulShutdown = async (signal) => {
  console.log(`\n📴 Received ${signal} — shutting down gracefully...`);
  
  // Stop accepting new connections
  server.close(async () => {
    try {
      // Close database connection pool
      await sequelize.close();
      console.log('✅ Database connections closed.');
    } catch (err) {
      console.error('⚠️  Error closing database:', err.message);
    }
    console.log('👋 Process exiting.');
    process.exit(0);
  });

  // Force exit after 15 seconds if graceful shutdown stalls
  setTimeout(() => {
    console.error('⚠️  Graceful shutdown timed out after 15s — forcing exit.');
    process.exit(1);
  }, 15000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/* =========================================
   KEEP-ALIVE SELF-PING
   Pings /health every 4 minutes so Railway
   never puts the service to sleep.
   Only active in production.
========================================= */
const startKeepAlive = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes
  const HEALTH_URL = process.env.SELF_URL
    ? `${process.env.SELF_URL}/health`
    : `https://bill-easy-production.up.railway.app/health`; // Set SELF_URL in Railway env to override

  // Wait 30s after boot before starting pings (let DB bootstrap settle)
  setTimeout(() => {
    const ping = () => {
      const lib = HEALTH_URL.startsWith('https') ? require('https') : require('http');
      const req = lib.get(HEALTH_URL, (res) => {
        console.log(`[KeepAlive] Pinged ${HEALTH_URL} → ${res.statusCode}`);
      });
      req.on('error', (err) => {
        console.warn(`[KeepAlive] Ping failed: ${err.message}`);
      });
      req.setTimeout(10000, () => {
        req.destroy();
        console.warn('[KeepAlive] Ping timed out');
      });
    };

    ping(); // immediate first ping
    setInterval(ping, PING_INTERVAL_MS);
    console.log(`[KeepAlive] Self-ping started — every 4 minutes → ${HEALTH_URL}`);
  }, 30 * 1000);
};

// Migration v2 - Force rebuild 2026-04-17T20:30
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Run security migrations first
    try {
      const runMigrations = require('./scripts/runMigrations');
      await runMigrations();
    } catch (migrationError) {
      console.warn('Migration warning (continuing):', migrationError.message);
    }

    // Run migrations to fix database schema
    console.log('Running database migrations...');
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');
    
    // Migration: Add missing columns to plans table
    try {
      // Check if plans table exists first
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('plans')) {
        // plans table migration skipped
      } else {
        const tableInfo = await queryInterface.describeTable('plans');
        
        if (!tableInfo.max_users) {
          // Migration: max_users column
          await queryInterface.addColumn('plans', 'max_users', {
            type: DataTypes.INTEGER,
            defaultValue: 1
          });
        }
        
        if (!tableInfo.max_invoices_per_month) {
          // Migration: max_invoices_per_month column
          await queryInterface.addColumn('plans', 'max_invoices_per_month', {
            type: DataTypes.INTEGER,
            defaultValue: 100
          });
        }
        
        if (!tableInfo.max_products) {
          // Migration: max_products column
          await queryInterface.addColumn('plans', 'max_products', {
            type: DataTypes.INTEGER,
            defaultValue: 100
          });
        }
        
        if (!tableInfo.storage_limit) {
          // Migration: storage_limit column
          await queryInterface.addColumn('plans', 'storage_limit', {
            type: DataTypes.INTEGER,
            defaultValue: 100
          });
        }
        
        if (!tableInfo.features) {
          // Migration: features column
          await queryInterface.addColumn('plans', 'features', {
            type: DataTypes.JSON,
            defaultValue: {}
          });
        }
        
        if (!tableInfo.is_active) {
          // Migration: is_active column
          await queryInterface.addColumn('plans', 'is_active', {
            type: DataTypes.BOOLEAN,
            defaultValue: true
          });
        }
        
        if (!tableInfo.billing_cycle) {
          // Migration: billing_cycle column
          await queryInterface.addColumn('plans', 'billing_cycle', {
            type: DataTypes.ENUM('monthly', '3month', '6month', 'yearly', 'lifetime'),
            defaultValue: 'monthly'
          });
        }
        
        // Plans migration done
      }

      // Migration: Add missing columns to users table
      if (tables.includes('users')) {
        const userTableInfo = await queryInterface.describeTable('users');
        
        if (!userTableInfo.password) {
          // Migration: password column
          await queryInterface.addColumn('users', 'password', {
            type: DataTypes.STRING,
            allowNull: true // Allow null for migration, but it will be populated
          });
        }
        
        if (!userTableInfo.permissions) {
          // Migration: permissions column
          await queryInterface.addColumn('users', 'permissions', {
            type: DataTypes.JSON,
            defaultValue: {}
          });
        }

        if (!userTableInfo.is_active) {
          // Migration: is_active column
          await queryInterface.addColumn('users', 'is_active', {
            type: DataTypes.BOOLEAN,
            defaultValue: true
          });
        }

        if (!userTableInfo.email_verified) {
          // Migration: email_verified column
          await queryInterface.addColumn('users', 'email_verified', {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          });
        }

        if (!userTableInfo.last_login) {
          // Migration: last_login column
          await queryInterface.addColumn('users', 'last_login', {
            type: DataTypes.DATE,
            allowNull: true
          });
        }

        if (!userTableInfo.role) {
          // Migration: role column
          await queryInterface.addColumn('users', 'role', {
            type: DataTypes.ENUM('owner', 'admin', 'staff'),
            defaultValue: 'staff'
          });
        }

        if (!userTableInfo.mobile_number) {
          // Migration: mobile_number column and drop phone
          await queryInterface.addColumn('users', 'mobile_number', {
            type: DataTypes.STRING,
            unique: true
          });
          
          // Optionally populate mobile_number from phone before dropping
          try {
             await sequelize.query('UPDATE "users" SET "mobile_number" = "phone" WHERE "phone" IS NOT NULL');
          } catch(e) {
             console.warn("Could not copy phone to mobile_number", e.message);
          }
          
          if (userTableInfo.phone) {
             await queryInterface.removeColumn('users', 'phone');
          }
        }
      }

      // Migration: Add missing columns to companies table
      if (tables.includes('companies')) {
        const compTableInfo = await queryInterface.describeTable('companies');
        const columnsToAdd = [
          { name: 'gst_registered', type: DataTypes.BOOLEAN, default: false },
          { name: 'enable_tds', type: DataTypes.BOOLEAN, default: false },
          { name: 'enable_tcs', type: DataTypes.BOOLEAN, default: false },
          { name: 'bank_name', type: DataTypes.STRING },
          { name: 'account_number', type: DataTypes.STRING },
          { name: 'ifsc_code', type: DataTypes.STRING },
          { name: 'branch_name', type: DataTypes.STRING },
          { name: 'qr_code', type: DataTypes.STRING },
          { name: 'terms_conditions', type: DataTypes.TEXT }
        ];

        for (const col of columnsToAdd) {
          if (!compTableInfo[col.name]) {
            // Migration column added
            await queryInterface.addColumn('companies', col.name, {
              type: col.type,
              defaultValue: col.default
            });
          }
        }
      }

      // Migration: Ensure AIUsage table exists
      if (!tables.includes('ai_usage')) {
        // Migration: ai_usage table
        await queryInterface.createTable('ai_usage', {
          id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
          user_id: { type: DataTypes.UUID, allowNull: false },
          company_id: { type: DataTypes.UUID, allowNull: false },
          date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
          count: { type: DataTypes.INTEGER, defaultValue: 0 },
          created_at: { type: DataTypes.DATE, allowNull: false },
          updated_at: { type: DataTypes.DATE, allowNull: false }
        });
        await queryInterface.addIndex('ai_usage', ['user_id', 'date'], { unique: true });
      }
    } catch (migrationError) {
      // Migration error handled
      // Don't throw - continue startup even if migration fails
    }

    // Only use alter: true in development; in production, use migrations
    const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
    await sequelize.sync(syncOptions);
    // Database synchronized

    // Ensure data integrity
    try {
      // Check if User table has password column before query
      const tableInfo = await queryInterface.describeTable('users');
      if (!tableInfo.password) {
        // Password column check skipped
      } else {
        const allUsers = await User.findAll();
        for (const user of allUsers) {
          if (user.company_id) {
            await UserCompany.findOrCreate({
              where: { user_id: user.id, company_id: user.company_id },
              defaults: { role: user.role || 'owner' }
            });
          }
        }
      }
    } catch (userIntegrityError) {
      // User integrity check warning
    }

    try {
      const companies = await Company.findAll({ include: [{ model: Godown }] });

      for (const company of companies) {
        // 1. Default Godown
        if (!company.Godowns || company.Godowns.length === 0) await ensureDefaultGodown(company);
      }
    } catch (companySetupError) {
      // Company setup warning
    }

    serverReady = true;
    console.log(`✅ DB bootstrap complete — server is fully ready on port ${PORT}`);

    // Start recurring invoice scheduler
    const { startScheduler } = require('./services/recurringInvoiceScheduler');
    startScheduler();
  } catch (error) {
    console.error('Server startup error (server still accepting requests):', error);
    // Mark as ready anyway — individual route handlers will surface DB errors naturally
    serverReady = true;
  }
};

startServer();
