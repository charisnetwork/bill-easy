const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { adminDB, saasDB } = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

require('dotenv').config();

// Initialize GCS storage
require('../../backend/utils/storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const allowedOrigins = [
      'https://admin.charisbilleasy.store',
      'http://localhost:5173',
      'http://localhost:3000',
      ...(process.env.ADMIN_FRONTEND_URL ? process.env.ADMIN_FRONTEND_URL.split(',') : [])
    ];
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') || 
                     origin.includes('.up.railway.app');
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret', 'x-admin-token'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', adminRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('ADMIN ERROR:', err);
  const status = err.status || 500;
  const message = (process.env.NODE_ENV === 'production' && status === 500) 
    ? 'Internal admin server error' 
    : err.message;

  res.status(status).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Database Sync & Server Start
const startServer = async () => {
  try {
    // Check for critical environment variables
    if (!process.env.ADMIN_SECRET) {
      console.warn('⚠️ WARNING: ADMIN_SECRET is not set. Admin API is insecure!');
    }

    // Authenticate SaaS DB (Read-Only access recommended)
    await saasDB.authenticate();
    console.log('✅ Connected to SaaS Database');

    // Sync Admin DB (Write Access for Affiliates, Expenses, etc.)
    await adminDB.authenticate();
    await adminDB.sync({ alter: true });
    console.log('✅ Connected and Synced Admin Database');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Developer Admin Control Center running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
