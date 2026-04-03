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

// Add SSL for cloud hosting if DATABASE_URL is present
if (process.env.DATABASE_URL_SaaS?.includes('railway') || process.env.DATABASE_URL_ADMIN?.includes('railway')) {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const saasDB = new Sequelize(process.env.DATABASE_URL_SaaS || 'postgres://pachu:nishu@localhost:5432/mybillbook', sequelizeOptions);

const adminDB = new Sequelize(process.env.DATABASE_URL_ADMIN || 'postgres://pachu:nishu@localhost:5432/mybillbook_admin', sequelizeOptions);

module.exports = { saasDB, adminDB };
