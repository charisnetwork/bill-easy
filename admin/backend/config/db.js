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

// Enable SSL only for Render hosting
if (process.env.DATABASE_URL?.includes('render.com')) {
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
