const { Sequelize } = require('sequelize');
require('dotenv').config();

const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.RAILWAY_PRIVATE_DOMAIN;

const sequelizeOptions = {
  dialect: 'postgres',
  logging: false,
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true
  }
};

// Enable SSL only for Render hosting (not Railway)
if (process.env.DATABASE_URL?.includes('render.com')) {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

// Disable SSL for Railway internal connections
if (isRailway) {
  sequelizeOptions.dialectOptions = {
    ssl: false
  };
}

// Both DBs use same connection (different schemas/tables)
const dbUrlInput = process.env.DATABASE_URL || 'postgres://pachu:nishu@localhost:5432/mybillbook';
const dbUrl = (typeof dbUrlInput === 'string' && (dbUrlInput.startsWith('postgres://') || dbUrlInput.startsWith('postgresql://')))
  ? dbUrlInput
  : 'postgres://pachu:nishu@localhost:5432/mybillbook';

const saasDB = new Sequelize(dbUrl, sequelizeOptions);

// Use DATABASE_URL_ADMIN if provided and valid, otherwise use same as saasDB
const adminUrlInput = process.env.DATABASE_URL_ADMIN;
const isValidAdminUrl = adminUrlInput && typeof adminUrlInput === 'string' && (adminUrlInput.startsWith('postgres://') || adminUrlInput.startsWith('postgresql://'));

const adminDB = isValidAdminUrl
  ? new Sequelize(adminUrlInput, sequelizeOptions)
  : saasDB;

module.exports = { saasDB, adminDB };
