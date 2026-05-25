/**
 * Customer Service - Offline-first CRUD operations
 */

import { getDB } from './database.js';
import { syncService } from './syncService.js';
import { formatISO } from 'date-fns';

export const customerService = {
  // Get all customers for a company
  async getAll(companyId, options = {}) {
    const db = await getDB();
    let query = `
      SELECT * FROM customers 
      WHERE company_id = $1 AND is_deleted = 0
    `;
    const params = [companyId];
    
    if (options.search) {
      query += ` AND (name LIKE $2 OR phone LIKE $2 OR gst_number LIKE $2)`;
      params.push(`%${options.search}%`);
    }
    
    query += ` ORDER BY name ASC`;
    
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }
    
    return await db.select(query, params);
  },
  
  // Get customer by ID
  async getById(id) {
    const db = await getDB();
    const results = await db.select(
      'SELECT * FROM customers WHERE id = $1 AND is_deleted = 0',
      [id]
    );
    return results[0] || null;
  },
  
  // Create new customer
  async create(customerData) {
    const db = await getDB();
    const localId = syncService.generateLocalId();
    const now = formatISO(new Date());
    
    const customer = {
      id: localId,
      local_id: localId,
      company_id: customerData.company_id,
      name: customerData.name,
      gst_number: customerData.gst_number || null,
      address: customerData.address || null,
      phone: customerData.phone || null,
      email: customerData.email || null,
      state: customerData.state || null,
      state_code: customerData.state_code || null,
      billing_address: customerData.billing_address || customerData.address || null,
      shipping_address: customerData.shipping_address || customerData.address || null,
      credit_limit: customerData.credit_limit || 0,
      opening_balance: customerData.opening_balance || 0,
      balance: customerData.opening_balance || 0,
      sync_status: 'pending',
      version: 1,
      is_deleted: 0,
      created_at: now,
      updated_at: now
    };
    
    await db.execute(`
      INSERT INTO customers (
        id, local_id, company_id, name, gst_number, address, phone, email,
        state, state_code, billing_address, shipping_address, credit_limit,
        opening_balance, balance, sync_status, version, is_deleted, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    `, Object.values(customer));
    
    // Queue for sync
    await syncService.queueOperation('customers', 'CREATE', customer, localId);
    
    return customer;
  },
  
  // Update customer
  async update(id, updates) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Customer not found');
    }
    
    const allowedFields = [
      'name', 'gst_number', 'address', 'phone', 'email', 'state',
      'state_code', 'billing_address', 'shipping_address', 'credit_limit'
    ];
    
    const setClauses = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${values.length + 1}`);
        values.push(updates[field]);
      }
    }
    
    if (setClauses.length === 0) {
      return existing;
    }
    
    setClauses.push(`sync_status = $${values.length + 1}`);
    setClauses.push(`version = version + 1`);
    setClauses.push(`updated_at = $${values.length + 2}`);
    values.push('pending', now, id);
    
    await db.execute(
      `UPDATE customers SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
    
    const updated = await this.getById(id);
    await syncService.queueOperation('customers', 'UPDATE', updated, id);
    
    return updated;
  },
  
  // Soft delete customer
  async delete(id) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    await db.execute(`
      UPDATE customers 
      SET is_deleted = 1, deleted_at = $1, sync_status = 'pending', version = version + 1
      WHERE id = $2
    `, [now, id]);
    
    await syncService.queueOperation('customers', 'DELETE', { id }, id);
    
    return { success: true };
  },
  
  // Update customer balance
  async updateBalance(id, amount) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    await db.execute(`
      UPDATE customers 
      SET balance = balance + $1, updated_at = $2, sync_status = 'pending', version = version + 1
      WHERE id = $3
    `, [amount, now, id]);
    
    return this.getById(id);
  }
};
