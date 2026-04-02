const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

// Common configuration to match SaaS backend exactly
const commonConfig = {
  dialect: 'postgres',
  logging: false, // Set to console.log for debugging if needed
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true
  },
  dialectOptions
};

// Main SaaS Database connection
const saasDB = new Sequelize(process.env.DATABASE_URL || process.env.DATABASE_URL_SaaS, commonConfig);

// Admin-specific Database connection
const adminDB = new Sequelize(process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL, commonConfig);

module.exports = { saasDB, adminDB };
