/**
 * Product Service - Offline-first CRUD operations
 */

import { getDB } from './database.js';
import { syncService } from './syncService.js';
import { formatISO } from 'date-fns';

export const productService = {
  // Get all products for a company
  async getAll(companyId, options = {}) {
    const db = await getDB();
    let query = `
      SELECT * FROM products 
      WHERE company_id = $1 AND is_deleted = 0
    `;
    const params = [companyId];
    
    if (options.search) {
      query += ` AND (name LIKE $2 OR sku LIKE $2 OR hsn_code LIKE $2)`;
      params.push(`%${options.search}%`);
    }
    
    if (options.category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(options.category);
    }
    
    if (options.lowStock) {
      query += ` AND current_stock <= min_stock_level`;
    }
    
    query += ` ORDER BY name ASC`;
    
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }
    
    return await db.select(query, params);
  },
  
  // Get product by ID
  async getById(id) {
    const db = await getDB();
    const results = await db.select(
      'SELECT * FROM products WHERE id = $1 AND is_deleted = 0',
      [id]
    );
    return results[0] || null;
  },
  
  // Get low stock products
  async getLowStock(companyId) {
    const db = await getDB();
    return await db.select(`
      SELECT * FROM products 
      WHERE company_id = $1 AND is_deleted = 0 AND current_stock <= min_stock_level
      ORDER BY current_stock ASC
    `, [companyId]);
  },
  
  // Create new product
  async create(productData) {
    const db = await getDB();
    const localId = syncService.generateLocalId();
    const now = formatISO(new Date());
    
    const product = {
      id: localId,
      local_id: localId,
      company_id: productData.company_id,
      name: productData.name,
      description: productData.description || null,
      hsn_code: productData.hsn_code || null,
      sku: productData.sku || null,
      category: productData.category || null,
      unit: productData.unit || 'pcs',
      purchase_price: productData.purchase_price || 0,
      sale_price: productData.sale_price || 0,
      gst_rate: productData.gst_rate || 0,
      opening_stock: productData.opening_stock || 0,
      current_stock: productData.opening_stock || 0,
      min_stock_level: productData.min_stock_level || 0,
      is_service: productData.is_service ? 1 : 0,
      sync_status: 'pending',
      version: 1,
      is_deleted: 0,
      created_at: now,
      updated_at: now
    };
    
    await db.execute(`
      INSERT INTO products (
        id, local_id, company_id, name, description, hsn_code, sku, category,
        unit, purchase_price, sale_price, gst_rate, opening_stock, current_stock,
        min_stock_level, is_service, sync_status, version, is_deleted, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    `, Object.values(product));
    
    await syncService.queueOperation('products', 'CREATE', product, localId);
    
    return product;
  },
  
  // Update product
  async update(id, updates) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Product not found');
    }
    
    const allowedFields = [
      'name', 'description', 'hsn_code', 'sku', 'category', 'unit',
      'purchase_price', 'sale_price', 'gst_rate', 'opening_stock',
      'current_stock', 'min_stock_level', 'is_service'
    ];
    
    const setClauses = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${values.length + 1}`);
        values.push(field === 'is_service' ? (updates[field] ? 1 : 0) : updates[field]);
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
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
    
    const updated = await this.getById(id);
    await syncService.queueOperation('products', 'UPDATE', updated, id);
    
    return updated;
  },
  
  // Update stock quantity
  async updateStock(id, quantity, operation = 'add') {
    const db = await getDB();
    const now = formatISO(new Date());
    
    const operator = operation === 'add' ? '+' : '-';
    
    await db.execute(`
      UPDATE products 
      SET current_stock = MAX(0, current_stock ${operator} $1),
          updated_at = $2,
          sync_status = 'pending',
          version = version + 1
      WHERE id = $3
    `, [quantity, now, id]);
    
    return this.getById(id);
  },
  
  // Soft delete product
  async delete(id) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    await db.execute(`
      UPDATE products 
      SET is_deleted = 1, deleted_at = $1, sync_status = 'pending', version = version + 1
      WHERE id = $2
    `, [now, id]);
    
    await syncService.queueOperation('products', 'DELETE', { id }, id);
    
    return { success: true };
  },
  
  // Get product categories for a company
  async getCategories(companyId) {
    const db = await getDB();
    const results = await db.select(`
      SELECT DISTINCT category FROM products 
      WHERE company_id = $1 AND is_deleted = 0 AND category IS NOT NULL
      ORDER BY category ASC
    `, [companyId]);
    
    return results.map(r => r.category);
  }
};
