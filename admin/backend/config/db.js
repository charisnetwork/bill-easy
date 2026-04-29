const { Sequelize } = require('sequelize');
const path = require('path');

// Basic Sequelize options
const sequelizeOptions = {
  dialect: 'postgres',
  logging: false,
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true
  }
};

// Log environment keys for debugging (without values for security)
const envKeys = Object.keys(process.env);
console.log('[DB Config] Environment Keys found:', envKeys.filter(k => k.includes('DATABASE') || k === 'PORT' || k === 'NODE_ENV'));

// Primary DB URL (Main SaaS DB)
let saasUrl = (process.env.DATABASE_URL_SaaS || process.env.DATABASE_URL || '').trim();
// Admin DB URL (Specific Admin DB or fallback to SaaS DB)
let adminUrl = (process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL || '').trim();

if (!saasUrl) {
  console.error('[DB Config] CRITICAL: DATABASE_URL_SaaS or DATABASE_URL is missing!');
  throw new Error('DATABASE_URL is missing in environment variables');
}

if (!adminUrl) {
  console.error('[DB Config] CRITICAL: DATABASE_URL_ADMIN or DATABASE_URL is missing!');
  throw new Error('DATABASE_URL_ADMIN is missing in environment variables');
}

// Ensure URLs have protocol
if (saasUrl && !saasUrl.includes('://')) {
  console.warn('[DB Config] SaaS URL missing protocol, prepending postgres://');
  saasUrl = `postgres://${saasUrl}`;
}
if (adminUrl && !adminUrl.includes('://')) {
  console.warn('[DB Config] Admin URL missing protocol, prepending postgres://');
  adminUrl = `postgres://${adminUrl}`;
}

// Add SSL for cloud hosting (Railway, Render, etc.)
if (saasUrl.includes('railway.app') || saasUrl.includes('render.com') || process.env.NODE_ENV === 'production') {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
  console.log('[DB Config] SSL Enabled for Database Connections');
}

console.log('[DB Config] Initializing Sequelize for SaaS DB (URL length:', saasUrl.length, ')');
const saasDB = new Sequelize(saasUrl, sequelizeOptions);

console.log('[DB Config] Initializing Sequelize for Admin DB (URL length:', adminUrl.length, ')');
const adminDB = new Sequelize(adminUrl, sequelizeOptions);

module.exports = { saasDB, adminDB };
