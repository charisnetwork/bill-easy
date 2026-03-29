const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialectOptions = {
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

const saasDB = new Sequelize(process.env.DATABASE_URL || process.env.DATABASE_URL_SaaS, {
  dialect: 'postgres',
  logging: false,
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true
  },
  dialectOptions
});

const adminDB = new Sequelize(process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true
  },
  dialectOptions
});

module.exports = { saasDB, adminDB };
