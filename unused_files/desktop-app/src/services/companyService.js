/**
 * Company Service - Offline-first CRUD operations
 */

import { getDB } from './database.js';
import { syncService } from './syncService.js';
import { formatISO } from 'date-fns';

export const companyService = {
  // Get all companies (excluding soft-deleted)
  async getAll() {
    const db = await getDB();
    return await db.select(`
      SELECT * FROM companies 
      WHERE is_deleted = 0 
      ORDER BY name ASC
    `);
  },
  
  // Get company by ID
  async getById(id) {
    const db = await getDB();
    const results = await db.select(
      'SELECT * FROM companies WHERE id = $1 AND is_deleted = 0',
      [id]
    );
    return results[0] || null;
  },
  
  // Create new company
  async create(companyData) {
    const db = await getDB();
    const localId = syncService.generateLocalId();
    const now = formatISO(new Date());
    
    const company = {
      id: localId,
      local_id: localId,
      name: companyData.name,
      gst_number: companyData.gst_number || null,
      address: companyData.address || null,
      phone: companyData.phone || null,
      email: companyData.email || null,
      logo_url: companyData.logo_url || null,
      bank_name: companyData.bank_name || null,
      account_number: companyData.account_number || null,
      ifsc_code: companyData.ifsc_code || null,
      branch_name: companyData.branch_name || null,
      terms_conditions: companyData.terms_conditions || null,
      gst_registered: companyData.gst_registered ? 1 : 0,
      enable_tds: companyData.enable_tds ? 1 : 0,
      enable_tcs: companyData.enable_tcs ? 1 : 0,
      sync_status: 'pending',
      version: 1,
      is_deleted: 0,
      created_at: now,
      updated_at: now
    };
    
    await db.execute(`
      INSERT INTO companies (
        id, local_id, name, gst_number, address, phone, email, logo_url,
        bank_name, account_number, ifsc_code, branch_name, terms_conditions,
        gst_registered, enable_tds, enable_tcs, sync_status, version, is_deleted,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    `, [
      company.id, company.local_id, company.name, company.gst_number,
      company.address, company.phone, company.email, company.logo_url,
      company.bank_name, company.account_number, company.ifsc_code,
      company.branch_name, company.terms_conditions, company.gst_registered,
      company.enable_tds, company.enable_tcs, company.sync_status,
      company.version, company.is_deleted, company.created_at, company.updated_at
    ]);
    
    // Queue for sync
    await syncService.queueOperation('companies', 'CREATE', company, localId);
    
    return company;
  },
  
  // Update company
  async update(id, updates) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    // Get existing company
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Company not found');
    }
    
    // Build update query
    const allowedFields = [
      'name', 'gst_number', 'address', 'phone', 'email', 'logo_url',
      'bank_name', 'account_number', 'ifsc_code', 'branch_name',
      'terms_conditions', 'gst_registered', 'enable_tds', 'enable_tcs'
    ];
    
    const setClauses = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClauses.push(`${field} = $${values.length + 1}`);
        values.push(field.includes('gst_registered') || field.includes('enable_') 
          ? (updates[field] ? 1 : 0) 
          : updates[field]);
      }
    }
    
    if (setClauses.length === 0) {
      return existing;
    }
    
    setClauses.push(`sync_status = $${values.length + 1}`);
    setClauses.push(`version = version + 1`);
    setClauses.push(`updated_at = $${values.length + 2}`);
    values.push('pending', now);
    values.push(id);
    
    await db.execute(
      `UPDATE companies SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
    
    // Get updated company
    const updated = await this.getById(id);
    
    // Queue for sync
    await syncService.queueOperation('companies', 'UPDATE', updated, id);
    
    return updated;
  },
  
  // Soft delete company
  async delete(id) {
    const db = await getDB();
    const now = formatISO(new Date());
    
    await db.execute(`
      UPDATE companies 
      SET is_deleted = 1, 
          deleted_at = $1, 
          sync_status = 'pending',
          version = version + 1
      WHERE id = $2
    `, [now, id]);
    
    // Queue for sync
    await syncService.queueOperation('companies', 'DELETE', { id }, id);
    
    return { success: true };
  },
  
  // Hard delete (only for local cleanup)
  async hardDelete(id) {
    const db = await getDB();
    await db.execute('DELETE FROM companies WHERE id = $1', [id]);
    return { success: true };
  },
  
  // Set active company for session
  setActiveCompany(companyId) {
    localStorage.setItem('active_company_id', companyId);
  },
  
  // Get active company
  getActiveCompany() {
    return localStorage.getItem('active_company_id');
  }
};
