/**
 * Bill Easy Local Database Service
 * Uses Tauri SQL Plugin with SQLite for offline-first storage
 */

import Database from '@tauri-apps/plugin-sql';

const DB_NAME = 'sqlite:billeasy.db';
let db = null;

// Database connection singleton
export async function getDB() {
  if (!db) {
    db = await Database.load(DB_NAME);
  }
  return db;
}

// Initialize database with all tables
export async function initializeDatabase() {
  const database = await getDB();
  
  // Enable foreign keys
  await database.execute('PRAGMA foreign_keys = ON');
  
  // Sync metadata table - tracks last sync times
  await database.execute(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT UNIQUE NOT NULL,
      last_sync_at TEXT,
      last_sync_version INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Sync queue/outbox for pending operations
  await database.execute(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      local_id TEXT NOT NULL,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
      payload TEXT NOT NULL, -- JSON string
      sync_status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'failed', 'completed'
      retry_count INTEGER DEFAULT 0,
      error_message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Companies table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY, -- Cloud ID (UUID)
      local_id TEXT UNIQUE NOT NULL, -- Local UUID
      name TEXT NOT NULL,
      gst_number TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      logo_url TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      branch_name TEXT,
      terms_conditions TEXT,
      gst_registered BOOLEAN DEFAULT 0,
      enable_tds BOOLEAN DEFAULT 0,
      enable_tcs BOOLEAN DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      version INTEGER DEFAULT 1,
      is_deleted BOOLEAN DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Customers table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      local_id TEXT UNIQUE NOT NULL,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      gst_number TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      state TEXT,
      state_code TEXT,
      billing_address TEXT,
      shipping_address TEXT,
      credit_limit REAL DEFAULT 0,
      opening_balance REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      version INTEGER DEFAULT 1,
      is_deleted BOOLEAN DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
  
  // Products table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      local_id TEXT UNIQUE NOT NULL,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      hsn_code TEXT,
      sku TEXT,
      category TEXT,
      unit TEXT DEFAULT 'pcs',
      purchase_price REAL DEFAULT 0,
      sale_price REAL DEFAULT 0,
      gst_rate REAL DEFAULT 0,
      opening_stock REAL DEFAULT 0,
      current_stock REAL DEFAULT 0,
      min_stock_level REAL DEFAULT 0,
      is_service BOOLEAN DEFAULT 0,
      sync_status TEXT DEFAULT 'pending',
      version INTEGER DEFAULT 1,
      is_deleted BOOLEAN DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
  
  // Invoices table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      local_id TEXT UNIQUE NOT NULL,
      company_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT,
      po_number TEXT,
      po_date TEXT,
      subtotal REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      taxable_amount REAL DEFAULT 0,
      cgst_amount REAL DEFAULT 0,
      sgst_amount REAL DEFAULT 0,
      igst_amount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'unpaid',
      notes TEXT,
      terms_conditions TEXT,
      is_einvoice BOOLEAN DEFAULT 0,
      einvoice_irn TEXT,
      sync_status TEXT DEFAULT 'pending',
      version INTEGER DEFAULT 1,
      is_deleted BOOLEAN DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  
  // Invoice Items table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      local_id TEXT UNIQUE NOT NULL,
      invoice_id TEXT NOT NULL,
      product_id TEXT,
      description TEXT NOT NULL,
      hsn_code TEXT,
      quantity REAL NOT NULL,
      unit TEXT,
      price REAL NOT NULL,
      discount_percent REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      taxable_amount REAL NOT NULL,
      gst_rate REAL DEFAULT 0,
      cgst_amount REAL DEFAULT 0,
      sgst_amount REAL DEFAULT 0,
      igst_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      sync_status TEXT DEFAULT 'pending',
      version INTEGER DEFAULT 1,
      is_deleted BOOLEAN DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  // Payments table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      local_id TEXT UNIQUE NOT NULL,
      company_id TEXT NOT NULL,
      invoice_id TEXT,
      customer_id TEXT,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_mode TEXT DEFAULT 'cash',
      reference_number TEXT,
      notes TEXT,
      sync_status TEXT DEFAULT 'pending',
      version INTEGER DEFAULT 1,
      is_deleted BOOLEAN DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  
  // Create indexes for better performance
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(sync_status)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_sync_status ON companies(sync_status)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_customers_sync ON customers(sync_status)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_products_sync ON products(sync_status)`);
  await database.execute(`CREATE INDEX IF NOT EXISTS idx_invoices_sync ON invoices(sync_status)`);
  
  console.log('Database initialized successfully');
  return database;
}

// Reset database (for testing/debugging)
export async function resetDatabase() {
  const database = await getDB();
  const tables = [
    'sync_queue', 'sync_metadata', 'payments', 'invoice_items',
    'invoices', 'products', 'customers', 'companies'
  ];
  
  for (const table of tables) {
    await database.execute(`DROP TABLE IF EXISTS ${table}`);
  }
  
  return initializeDatabase();
}

export { db };
