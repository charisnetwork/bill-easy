/**
 * Invoice Service - Offline-first CRUD operations with items
 */

import { getDB } from './database.js';
import { syncService } from './syncService.js';
import { formatISO } from 'date-fns';

export const invoiceService = {
  // Get all invoices for a company
  async getAll(companyId, options = {}) {
    const db = await getDB();
    let query = `
      SELECT i.*, c.name as customer_name, c.phone as customer_phone
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.company_id = $1 AND i.is_deleted = 0
    `;
    const params = [companyId];
    
    if (options.customerId) {
      query += ` AND i.customer_id = $${params.length + 1}`;
      params.push(options.customerId);
    }
    
    if (options.paymentStatus) {
      query += ` AND i.payment_status = $${params.length + 1}`;
      params.push(options.paymentStatus);
    }
    
    if (options.startDate && options.endDate) {
      query += ` AND i.invoice_date BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(options.startDate, options.endDate);
    }
    
    query += ` ORDER BY i.invoice_date DESC, i.created_at DESC`;
    
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }
    
    return await db.select(query, params);
  },
  
  // Get invoice by ID with items
  async getById(id) {
    const db = await getDB();
    
    const invoices = await db.select(`
      SELECT i.*, c.name as customer_name, c.address as customer_address,
             c.gst_number as customer_gst, c.phone as customer_phone
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.id = $1 AND i.is_deleted = 0
    `, [id]);
    
    if (invoices.length === 0) {
      return null;
    }
    
    const invoice = invoices[0];
    
    // Get invoice items
    const items = await db.select(`
      SELECT ii.*, p.name as product_name
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = $1 AND ii.is_deleted = 0
    `, [id]);
    
    invoice.items = items;
    return invoice;
  },
  
  // Get next invoice number
  async getNextInvoiceNumber(companyId) {
    const db = await getDB();
    const result = await db.select(`
      SELECT invoice_number FROM invoices 
      WHERE company_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [companyId]);
    
    if (result.length === 0) {
      return 'INV-0001';
    }
    
    const lastNumber = result[0].invoice_number;
    const match = lastNumber.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1]) + 1;
      const prefix = lastNumber.substring(0, lastNumber.length - match[1].length);
      return `${prefix}${num.toString().padStart(4, '0')}`;
    }
    
    return `INV-${Date.now()}`;
  },
  
  // Create invoice with items
  async create(invoiceData, items) {
    const db = await getDB();
    const localId = syncService.generateLocalId();
    const now = formatISO(new Date());
    
    // Calculate totals
    const totals = this.calculateTotals(items);
    
    const invoice = {
      id: localId,
      local_id: localId,
      company_id: invoiceData.company_id,
      customer_id: invoiceData.customer_id,
      invoice_number: invoiceData.invoice_number || await this.getNextInvoiceNumber(invoiceData.company_id),
      invoice_date: invoiceData.invoice_date || now.split('T')[0],
      due_date: invoiceData.due_date || null,
      po_number: invoiceData.po_number || null,
      po_date: invoiceData.po_date || null,
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      taxable_amount: totals.taxableAmount,
      cgst_amount: totals.cgstAmount,
      sgst_amount: totals.sgstAmount,
      igst_amount: totals.igstAmount,
      total_amount: totals.totalAmount,
      amount_paid: invoiceData.amount_paid || 0,
      balance_due: totals.totalAmount - (invoiceData.amount_paid || 0),
      payment_status: (invoiceData.amount_paid || 0) >= totals.totalAmount ? 'paid' : 'unpaid',
      notes: invoiceData.notes || null,
      terms_conditions: invoiceData.terms_conditions || null,
      sync_status: 'pending',
      version: 1,
      is_deleted: 0,
      created_at: now,
      updated_at: now
    };
    
    // Start transaction
    await db.execute('BEGIN TRANSACTION');
    
    try {
      // Insert invoice
      await db.execute(`
        INSERT INTO invoices (
          id, local_id, company_id, customer_id, invoice_number, invoice_date, due_date,
          po_number, po_date, subtotal, discount_amount, taxable_amount,
          cgst_amount, sgst_amount, igst_amount, total_amount, amount_paid,
          balance_due, payment_status, notes, terms_conditions,
          sync_status, version, is_deleted, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      `, Object.values(invoice));
      
      // Insert items
      for (const item of items) {
        await this.createInvoiceItem(localId, item, db);
      }
      
      // Update customer balance
      await db.execute(`
        UPDATE customers 
        SET balance = balance + $1, updated_at = $2
        WHERE id = $3
      `, [invoice.balance_due, now, invoice.customer_id]);
      
      await db.execute('COMMIT');
      
      // Queue for sync
      await syncService.queueOperation('invoices', 'CREATE', { ...invoice, items }, localId);
      
      return this.getById(localId);
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
  },
  
  // Create invoice item
  async createInvoiceItem(invoiceId, itemData, dbInstance = null) {
    const db = dbInstance || await getDB();
    const localId = syncService.generateLocalId();
    const now = formatISO(new Date());
    
    const item = {
      id: localId,
      local_id: localId,
      invoice_id: invoiceId,
      product_id: itemData.product_id || null,
      description: itemData.description,
      hsn_code: itemData.hsn_code || null,
      quantity: itemData.quantity,
      unit: itemData.unit || 'pcs',
      price: itemData.price,
      discount_percent: itemData.discount_percent || 0,
      discount_amount: itemData.discount_amount || 0,
      taxable_amount: itemData.taxable_amount,
      gst_rate: itemData.gst_rate || 0,
      cgst_amount: itemData.cgst_amount || 0,
      sgst_amount: itemData.sgst_amount || 0,
      igst_amount: itemData.igst_amount || 0,
      total_amount: itemData.total_amount,
      sync_status: 'pending',
      version: 1,
      is_deleted: 0,
      created_at: now,
      updated_at: now
    };
    
    await db.execute(`
      INSERT INTO invoice_items (
        id, local_id, invoice_id, product_id, description, hsn_code, quantity,
        unit, price, discount_percent, discount_amount, taxable_amount, gst_rate,
        cgst_amount, sgst_amount, igst_amount, total_amount, sync_status,
        version, is_deleted, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    `, Object.values(item));
    
    // Update product stock if product_id exists
    if (itemData.product_id) {
      await db.execute(`
        UPDATE products 
        SET current_stock = MAX(0, current_stock - $1),
            updated_at = $2,
            sync_status = 'pending',
            version = version + 1
        WHERE id = $3
      `, [itemData.quantity, now, itemData.product_id]);
    }
    
    return item;
  },
  
  // Calculate invoice totals
  calculateTotals(items) {
    let subtotal = 0;
    let discountAmount = 0;
    let taxableAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    
    for (const item of items) {
      const itemTotal = item.quantity * item.price;
      const itemDiscount = item.discount_amount || (item.discount_percent ? itemTotal * (item.discount_percent / 100) : 0);
      const itemTaxable = itemTotal - itemDiscount;
      
      subtotal += itemTotal;
      discountAmount += itemDiscount;
      taxableAmount += itemTaxable;
      
      if (item.gst_rate > 0) {
        const gstAmount = itemTaxable * (item.gst_rate / 100);
        // Assuming intra-state (CGST + SGST)
        cgstAmount += gstAmount / 2;
        sgstAmount += gstAmount / 2;
      }
    }
    
    return {
      subtotal,
      discountAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount: taxableAmount + cgstAmount + sgstAmount + igstAmount
    };
  },
  
  // Record payment
  async recordPayment(invoiceId, paymentData) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    const invoice = await this.getById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    const newAmountPaid = invoice.amount_paid + paymentData.amount;
    const newBalanceDue = invoice.total_amount - newAmountPaid;
    const paymentStatus = newBalanceDue <= 0 ? 'paid' : (newAmountPaid > 0 ? 'partial' : 'unpaid');
    
    await db.execute(`
      UPDATE invoices 
      SET amount_paid = $1,
          balance_due = $2,
          payment_status = $3,
          updated_at = $4,
          sync_status = 'pending',
          version = version + 1
      WHERE id = $5
    `, [newAmountPaid, newBalanceDue, paymentStatus, now, invoiceId]);
    
    // Update customer balance
    await db.execute(`
      UPDATE customers 
      SET balance = balance - $1, updated_at = $2
      WHERE id = $3
    `, [paymentData.amount, now, invoice.customer_id]);
    
    return this.getById(invoiceId);
  },
  
  // Soft delete invoice
  async delete(id) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    const invoice = await this.getById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    await db.execute('BEGIN TRANSACTION');
    
    try {
      // Restore stock for items
      for (const item of invoice.items) {
        if (item.product_id) {
          await db.execute(`
            UPDATE products 
            SET current_stock = current_stock + $1,
                updated_at = $2,
                sync_status = 'pending',
                version = version + 1
            WHERE id = $3
          `, [item.quantity, now, item.product_id]);
        }
      }
      
      // Reverse customer balance
      await db.execute(`
        UPDATE customers 
        SET balance = balance - $1, updated_at = $2
        WHERE id = $3
      `, [invoice.balance_due, now, invoice.customer_id]);
      
      // Soft delete invoice
      await db.execute(`
        UPDATE invoices 
        SET is_deleted = 1, deleted_at = $1, sync_status = 'pending', version = version + 1
        WHERE id = $2
      `, [now, id]);
      
      // Soft delete items
      await db.execute(`
        UPDATE invoice_items 
        SET is_deleted = 1, sync_status = 'pending', version = version + 1
        WHERE invoice_id = $1
      `, [id]);
      
      await db.execute('COMMIT');
      
      await syncService.queueOperation('invoices', 'DELETE', { id }, id);
      
      return { success: true };
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
  },
  
  // Get dashboard stats
  async getDashboardStats(companyId, period = 'today') {
    const db = await getDB();
    
    let dateFilter = '';
    if (period === 'today') {
      dateFilter = `AND invoice_date = date('now')`;
    } else if (period === 'week') {
      dateFilter = `AND invoice_date >= date('now', '-7 days')`;
    } else if (period === 'month') {
      dateFilter = `AND invoice_date >= date('now', '-30 days')`;
    }
    
    const [salesResult, invoiceCount, pendingPayments] = await Promise.all([
      db.select(`
        SELECT COALESCE(SUM(total_amount), 0) as total 
        FROM invoices 
        WHERE company_id = $1 AND is_deleted = 0 ${dateFilter}
      `, [companyId]),
      db.select(`
        SELECT COUNT(*) as count 
        FROM invoices 
        WHERE company_id = $1 AND is_deleted = 0 ${dateFilter}
      `, [companyId]),
      db.select(`
        SELECT COALESCE(SUM(balance_due), 0) as total 
        FROM invoices 
        WHERE company_id = $1 AND is_deleted = 0 AND payment_status != 'paid'
      `, [companyId])
    ]);
    
    return {
      totalSales: salesResult[0]?.total || 0,
      invoiceCount: invoiceCount[0]?.count || 0,
      pendingAmount: pendingPayments[0]?.total || 0
    };
  }
};
