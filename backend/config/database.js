const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
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
