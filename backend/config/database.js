const { Sequelize } = require('sequelize');

// Check if we're in Railway environment
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.RAILWAY_PRIVATE_DOMAIN;

// Use DATABASE_PUBLIC_URL if available (for external connections), otherwise use DATABASE_URL
const databaseUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false,
      define: {
        freezeTableName: true,
        underscored: true,
        timestamps: true
      },
      quoteIdentifiers: true,
      dialectOptions: isRailway
        ? {
            // For Railway private networking, SSL may not be required
            ssl: false
          }
        : {
            ssl: {
              require: true,
              rejectUnauthorized: false
            }
          }
    })
  : new Sequelize(
      process.env.DB_NAME || 'mybillbook',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASS || 'nishu',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log,
        define: {
          freezeTableName: true,
          underscored: true,
          timestamps: true
        },
        quoteIdentifiers: true
      }
    );

module.exports = sequelize;
