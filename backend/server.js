require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { rateLimit } = require('express-rate-limit');

const { sequelize, Plan, Company, Subscription, Godown, User, UserCompany } = require('./models');

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
  // Production custom domain (if using)
  'https://charisbilleasy.store',
  'https://www.charisbilleasy.store',
  // Local development
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

// Add FRONTEND_URL from env (comma-separated for multiple origins)
if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  ALLOWED_ORIGINS.push(...envOrigins);
  console.log('CORS: Added FRONTEND_URL origins:', envOrigins);
}

// Helper to check if origin matches allowed patterns
const isOriginAllowed = (origin) => {
  // Exact match
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  
  // Allow all Vercel preview deployments (xxx.vercel.app)
  if (origin && origin.endsWith('.vercel.app')) return true;
  
  // Allow Railway app domains
  if (origin && origin.includes('.up.railway.app')) return true;
  
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from: ${origin}`);
        console.warn(`Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
        console.warn(`Pattern matches: *.vercel.app, *.up.railway.app`);
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

app.use(morgan('dev'));

/* =========================================
   RATE LIMITING
========================================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    error: 'Too many requests, please try again later'
  }
});

app.use(limiter);

/* =========================================
   BODY PARSER
========================================= */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================================
   HEALTH CHECK
========================================= */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: "Bill Easy Backend is running.",
    port: process.env.PORT || 8001,
    status: "isolated"
  });
});

/* =========================================
   API ROUTES
========================================= */

app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/expenses", expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/eway-bills', ewayBillRoutes);
app.use('/api/credit-notes', creditNoteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/staff', require('./routes/staff'));
app.use("/api/utilities", require("./routes/utilities"));
app.use("/uploads", express.static("uploads"));

/* =========================================
   ROOT ENDPOINT
========================================= */

app.get('/api', (req, res) => {
  res.json({
    name: 'Bill Easy API',
    version: '1.0.0'
  });
});

/* =========================================
   ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    console.error(`CORS ERROR: Request from ${req.headers.origin} blocked`);
    console.error(`Request URL: ${req.url}`);
    console.error(`Request Method: ${req.method}`);
    return res.status(403).json({
      error: 'CORS error: Origin not allowed',
      origin: req.headers.origin,
      allowedOrigins: ALLOWED_ORIGINS
    });
  }
  
  console.error('ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

/* =========================================
   404 HANDLER
========================================= */

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

/* =========================================
   SEED DEFAULT PLANS
========================================= */

const seedPlans = async () => {
  try {
    const plans = [
      {
        plan_name: 'Free Account',
        price: 0,
        billing_cycle: 'lifetime',
        max_users: 1,
        max_invoices_per_month: 50,
        max_products: 100,
        features: {
          gst_billing: true,
          inventory_management: true,
          reports: true,
          quotations: true,
          eway_bills: false,
          multi_godowns: false,
          staff_attendance_payroll: false,
          manage_businesses: 1,
          user_activity_tracker: false
        },
        is_active: true
      },
      {
        plan_name: 'Premium',
        price: 499,
        billing_cycle: '3month',
        max_users: 5,
        max_invoices_per_month: 999999,
        max_products: 10000,
        features: {
          gst_billing: true,
          inventory_management: true,
          reports: true,
          quotations: true,
          eway_bills: true, // Limited access check in Guard
          multi_godowns: true,
          staff_attendance_payroll: false,
          manage_businesses: 2,
          user_activity_tracker: false
        },
        is_active: true
      },
      {
        plan_name: 'Enterprise',
        price: 699,
        billing_cycle: '3month',
        max_users: 20,
        max_invoices_per_month: 999999,
        max_products: 100000,
        features: {
          gst_billing: true,
          inventory_management: true,
          reports: true,
          quotations: true,
          eway_bills: true,
          multi_godowns: true,
          staff_attendance_payroll: true,
          manage_businesses: 3,
          user_activity_tracker: true,
          priority_support: true
        },
        is_active: true
      }
    ];

    for (const planData of plans) {
      const [plan, created] = await Plan.findOrCreate({
        where: { plan_name: planData.plan_name },
        defaults: planData
      });

      if (!created) {
        await plan.update(planData);
      }
    }

    // Also handle migration from old names if they exist
    const oldPlans = ['Zero Account', 'Free'];
    const newFreePlan = await Plan.findOne({ where: { plan_name: 'Free Account' } });
    
    if (newFreePlan) {
      for (const oldName of oldPlans) {
        const oldPlan = await Plan.findOne({ where: { plan_name: oldName } });
        if (oldPlan) {
          await Subscription.update(
            { plan_id: newFreePlan.id },
            { where: { plan_id: oldPlan.id } }
          );
          await oldPlan.destroy();
        }
      }
    }

    console.log('Plans seeded/updated successfully');
  } catch (error) {
    console.error('Plan seed error:', error);
  }
};

/* =========================================
   SERVER START
========================================= */

const PORT = process.env.PORT || 8001;

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Migration v2 - Force rebuild 2026-04-17T20:30
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    // Run migrations to fix database schema
    console.log('Running database migrations...');
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');
    
    // Migration: Add missing columns to plans table
    try {
      // Check if plans table exists first
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('plans')) {
        console.log('  - plans table does not exist, skipping migration');
      } else {
        const tableInfo = await queryInterface.describeTable('plans');
        
        if (!tableInfo.max_users) {
          console.log('  - Adding max_users column to plans');
          await queryInterface.addColumn('plans', 'max_users', {
            type: DataTypes.INTEGER,
            defaultValue: 1
          });
        }
        
        if (!tableInfo.max_invoices_per_month) {
          console.log('  - Adding max_invoices_per_month column to plans');
          await queryInterface.addColumn('plans', 'max_invoices_per_month', {
            type: DataTypes.INTEGER,
            defaultValue: 100
          });
        }
        
        if (!tableInfo.max_products) {
          console.log('  - Adding max_products column to plans');
          await queryInterface.addColumn('plans', 'max_products', {
            type: DataTypes.INTEGER,
            defaultValue: 100
          });
        }
        
        if (!tableInfo.storage_limit) {
          console.log('  - Adding storage_limit column to plans');
          await queryInterface.addColumn('plans', 'storage_limit', {
            type: DataTypes.INTEGER,
            defaultValue: 100
          });
        }
        
        if (!tableInfo.features) {
          console.log('  - Adding features column to plans');
          await queryInterface.addColumn('plans', 'features', {
            type: DataTypes.JSON,
            defaultValue: {}
          });
        }
        
        if (!tableInfo.is_active) {
          console.log('  - Adding is_active column to plans');
          await queryInterface.addColumn('plans', 'is_active', {
            type: DataTypes.BOOLEAN,
            defaultValue: true
          });
        }
        
        if (!tableInfo.billing_cycle) {
          console.log('  - Adding billing_cycle column to plans');
          await queryInterface.addColumn('plans', 'billing_cycle', {
            type: DataTypes.ENUM('monthly', '3month', '6month', 'yearly', 'lifetime'),
            defaultValue: 'monthly'
          });
        }
        
        console.log('Plans table migration completed');
      }

      // Migration: Add missing columns to users table
      if (tables.includes('users')) {
        const userTableInfo = await queryInterface.describeTable('users');
        
        if (!userTableInfo.password) {
          console.log('  - Adding password column to users');
          await queryInterface.addColumn('users', 'password', {
            type: DataTypes.STRING,
            allowNull: true // Allow null for migration, but it will be populated
          });
        }
        
        if (!userTableInfo.permissions) {
          console.log('  - Adding permissions column to users');
          await queryInterface.addColumn('users', 'permissions', {
            type: DataTypes.JSON,
            defaultValue: {}
          });
        }
      }
    } catch (migrationError) {
      console.error('Plans table migration error:', migrationError.message);
      console.error(migrationError.stack);
      // Don't throw - continue startup even if migration fails
    }

    // Only use alter: true in development; in production, use migrations
    const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
    await sequelize.sync(syncOptions);
    console.log('Database synchronized');

    await seedPlans();

    // Scan for expired subscriptions and downgrade
    try {
      const { Op } = require('sequelize');
      const freePlan = await Plan.findOne({ where: { plan_name: 'Free Account' } });
      if (freePlan) {
        await Subscription.update(
          { plan_id: freePlan.id, expiry_date: null, status: 'active' },
          { 
            where: { 
              expiry_date: { [Op.lt]: new Date() },
              plan_id: { [Op.ne]: freePlan.id }
            } 
          }
        );
      }
    } catch (checkExpiredError) {
      console.warn('Warning: Could not check expired subscriptions:', checkExpiredError.message);
      // Continue startup - this might happen if plans table columns are missing
    }
    
    // Ensure data integrity
    try {
      // Check if User table has password column before query
      const tableInfo = await queryInterface.describeTable('users');
      if (!tableInfo.password) {
        console.warn('⚠️ WARNING: "password" column is missing in users table. Skipping integrity check.');
        console.log('Available columns in users:', Object.keys(tableInfo));
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
      console.warn('Warning: Could not ensure user data integrity:', userIntegrityError.message);
    }

    try {
      const companies = await Company.findAll({
        include: [{ model: Subscription }, { model: Godown }]
      });
      
      let freePlan;
      try {
        freePlan = await Plan.findOne({ where: { plan_name: 'Free Account' } });
      } catch (planError) {
        console.warn('Warning: Could not fetch Free Account plan:', planError.message);
      }

      for (const company of companies) {
        // 1. Default Godown
        if (!company.Godowns || company.Godowns.length === 0) {
          console.log(`Creating default Godown for: ${company.name}`);
          await Godown.create({
            company_id: company.id,
            name: 'Main Store',
            address: company.address || 'Main Office',
            is_default: true,
            is_active: true
          });
        }
        
        // 2. Default Subscription
        if (!company.Subscription && freePlan) {
          console.log(`Creating Free Account sub for: ${company.name}`);
          const expiry = new Date();
          expiry.setFullYear(expiry.getFullYear() + 10);
          await Subscription.create({
            company_id: company.id,
            plan_id: freePlan.id,
            status: 'active',
            payment_status: 'paid',
            expiry_date: expiry,
            usage: { invoices: 0, eway_bills: 0, godowns: 0, products: 0 }
          });
        }
      }
    } catch (companySetupError) {
      console.warn('Warning: Could not setup default company data:', companySetupError.message);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('Charis is now powered by Gemini 3 Flash');
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
