const { Sequelize } = require('sequelize');

// Connection pool config — prevents exhausting Railway's ~25 connection limit under traffic
const poolConfig = {
  max: 10,       // Maximum concurrent connections
  min: 2,        // Keep at least 2 connections alive
  acquire: 30000, // Max ms to wait for a connection before throwing error
  idle: 10000    // Release idle connections after 10s
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      pool: poolConfig,
      define: {
        freezeTableName: true,
        underscored: true,
        timestamps: true
      },
      quoteIdentifiers: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: poolConfig,
        define: {
          freezeTableName: true,
          underscored: true,
          timestamps: true
        },
        quoteIdentifiers: true
      }
    );

module.exports = sequelize;
