const { DataTypes } = require('sequelize');
const { adminDB } = require('../config/db');

const Affiliate = adminDB.define('Affiliate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  company_name: { type: DataTypes.STRING, allowNull: false },
  contact_person: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  mobile_no: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
}, { 
  tableName: 'Affiliates', 
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const PlatformExpense = adminDB.define('PlatformExpense', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  category: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  description: { type: DataTypes.TEXT }
}, { 
  tableName: 'PlatformExpenses', 
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const GlobalNotification = adminDB.define('GlobalNotification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  target_audience: { type: DataTypes.STRING, defaultValue: 'all' },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { 
  tableName: 'GlobalNotifications', 
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const AdminUser = adminDB.define('AdminUser', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, defaultValue: 'Prashanth' },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  last_password_reset: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'AdminUsers' });

const AdminOTP = adminDB.define('AdminOTP', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false },
  otp: { type: DataTypes.STRING, allowNull: false },
  expires_at: { type: DataTypes.DATE, allowNull: false },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'AdminOTPs' });

module.exports = { 
  Affiliate, 
  PlatformExpense, 
  GlobalNotification,
  AdminUser,
  AdminOTP
};
