const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelizeOptions = {
  dialect: 'postgres',
  logging: false,
  define: {
    freezeTableName: true,
    underscored: true,
    timestamps: true
  }
};

// Add SSL for cloud hosting (Render, Railway, etc.)
const isCloudHosting = process.env.DATABASE_URL?.includes('render.com') || 
                       process.env.DATABASE_URL?.includes('railway') ||
                       process.env.DATABASE_URL_ADMIN?.includes('render.com') ||
                       process.env.DATABASE_URL_ADMIN?.includes('railway') ||
                       process.env.NODE_ENV === 'production';

if (isCloudHosting) {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

// Use environment variables with fallbacks for local development
const saasDB = new Sequelize(
  process.env.DATABASE_URL || 'postgres://pachu:nishu@localhost:5432/mybillbook', 
  sequelizeOptions
);

const adminDB = new Sequelize(
  process.env.DATABASE_URL_ADMIN || 'postgres://pachu:nishu@localhost:5432/mybillbook_admin', 
  sequelizeOptions
);

module.exports = { saasDB, adminDB };
