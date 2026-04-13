const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const path = require('path');
const { adminDB, saasDB } = require('./config/db');
const { AdminUser } = require('./models/adminModels');
const adminRoutes = require('./routes/adminRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3025;

// Robust CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
    'https://admin.charisbilleasy.store',
    'https://bill-easy-admin-production.up.railway.app',
    'http://localhost:3021'
  ];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Explicit Pre-flight handler
app.options('*', cors());

app.use(express.json());
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', adminRoutes);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
  });
}

// Database Sync & Server Start
const startServer = async () => {
  try {
    // Authenticate SaaS DB (Read-Only access recommended)
    await saasDB.authenticate();
    console.log('✅ Connected to SaaS Database');

    // Sync Admin DB (Write Access for Affiliates, Expenses, etc.)
    await adminDB.authenticate();
    await adminDB.sync({ alter: true });
    console.log('✅ Connected and Synced Admin Database');

    // Seed Default Admin User
    await seedDefaultAdmin();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Developer Admin Control Center running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Seed Default Admin User
const seedDefaultAdmin = async () => {
  try {
    const defaultEmail = 'pachu.mgd@gmail.com';
    const defaultPassword = 'nishu@143';
    
    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      where: { email: defaultEmail }
    });
    
    if (!existingAdmin) {
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
      
      // Create default admin
      await AdminUser.create({
        email: defaultEmail,
        password_hash: passwordHash,
        name: 'Pachu Admin',
        role: 'super_admin',
        is_active: true
      });
      
      console.log('✅ Default admin user created:', defaultEmail);
    } else {
      console.log('ℹ️ Admin user already exists:', defaultEmail);
    }
  } catch (error) {
    console.error('❌ Error seeding default admin:', error);
  }
};

startServer();
