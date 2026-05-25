/**
 * Bill Easy Sync Service
 * Handles offline-first synchronization with cloud backend
 */

import { getDB } from './database.js';
import { v4 as uuidv4 } from 'uuid';
import { formatISO } from 'date-fns';

const API_BASE_URL = 'https://bill-easy-production-v4.up.railway.app/api';
const SYNC_BATCH_SIZE = 50;
const MAX_RETRY_ATTEMPTS = 5;

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncCallbacks = [];
    this.conflictResolution = 'local-wins'; // 'local-wins', 'remote-wins', 'manual'
  }
  
  // Subscribe to sync status changes
  onSyncStatus(callback) {
    this.syncCallbacks.push(callback);
    return () => {
      this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
    };
  }
  
  notifySyncStatus(status, progress = 0, message = '') {
    this.syncCallbacks.forEach(cb => cb({ status, progress, message }));
  }
  
  // Check network connectivity
  async isOnline() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  // Generate unique local ID
  generateLocalId() {
    return `local_${uuidv4()}`;
  }
  
  // Queue an operation for sync
  async queueOperation(tableName, operation, payload, localId = null) {
    const db = await getDB();
    const id = localId || this.generateLocalId();
    
    await db.execute(`
      INSERT INTO sync_queue (local_id, table_name, operation, payload, sync_status, created_at)
      VALUES ($1, $2, $3, $4, 'pending', $5)
    `, [id, tableName, operation, JSON.stringify(payload), formatISO(new Date())]);
    
    return id;
  }
  
  // Get pending sync operations
  async getPendingOperations(limit = SYNC_BATCH_SIZE) {
    const db = await getDB();
    return await db.select(`
      SELECT * FROM sync_queue 
      WHERE sync_status IN ('pending', 'failed') 
        AND retry_count < $1
      ORDER BY created_at ASC
      LIMIT $2
    `, [MAX_RETRY_ATTEMPTS, limit]);
  }
  
  // Update sync operation status
  async updateSyncStatus(queueId, status, errorMessage = null) {
    const db = await getDB();
    
    if (status === 'failed') {
      await db.execute(`
        UPDATE sync_queue 
        SET sync_status = $1, 
            retry_count = retry_count + 1,
            error_message = $2,
            updated_at = $3
        WHERE id = $4
      `, [status, errorMessage, formatISO(new Date()), queueId]);
    } else {
      await db.execute(`
        UPDATE sync_queue 
        SET sync_status = $1, 
            updated_at = $2
        WHERE id = $3
      `, [status, formatISO(new Date()), queueId]);
    }
  }
  
  // Remove completed operations from queue
  async clearCompletedOperations() {
    const db = await getDB();
    await db.execute(`DELETE FROM sync_queue WHERE sync_status = 'completed'`);
  }
  
  // Main sync function - pulls and pushes data
  async sync(authToken) {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }
    
    const online = await this.isOnline();
    if (!online) {
      this.notifySyncStatus('offline', 0, 'No internet connection');
      return { success: false, message: 'No internet connection', offline: true };
    }
    
    this.isSyncing = true;
    this.notifySyncStatus('syncing', 10, 'Starting sync...');
    
    try {
      // Step 1: Push local changes to cloud
      this.notifySyncStatus('syncing', 30, 'Uploading local changes...');
      const pushResult = await this.pushChanges(authToken);
      
      // Step 2: Pull latest changes from cloud
      this.notifySyncStatus('syncing', 60, 'Downloading cloud changes...');
      const pullResult = await this.pullChanges(authToken);
      
      // Step 3: Clear completed operations
      await this.clearCompletedOperations();
      
      // Step 4: Update sync metadata
      await this.updateSyncMetadata();
      
      this.notifySyncStatus('completed', 100, 'Sync completed successfully');
      
      return {
        success: true,
        pushed: pushResult,
        pulled: pullResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifySyncStatus('error', 0, `Sync failed: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Push local changes to cloud
  async pushChanges(authToken) {
    const pending = await this.getPendingOperations();
    const results = { success: 0, failed: 0, items: [] };
    
    for (const operation of pending) {
      try {
        await this.updateSyncStatus(operation.id, 'syncing');
        
        const payload = JSON.parse(operation.payload);
        const endpoint = this.getEndpointForTable(operation.table_name);
        
        let response;
        switch (operation.operation) {
          case 'CREATE':
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify(payload)
            });
            break;
            
          case 'UPDATE':
            response = await fetch(`${API_BASE_URL}${endpoint}/${payload.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify(payload)
            });
            break;
            
          case 'DELETE':
            response = await fetch(`${API_BASE_URL}${endpoint}/${payload.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });
            break;
        }
        
        if (response.ok) {
          const data = await response.json();
          
          // Update local record with cloud ID if provided
          if (data.id && data.id !== payload.id) {
            await this.updateLocalRecordId(operation.table_name, payload.id, data.id);
          }
          
          await this.updateSyncStatus(operation.id, 'completed');
          results.success++;
          results.items.push({ id: operation.id, status: 'success' });
        } else {
          const error = await response.text();
          throw new Error(`HTTP ${response.status}: ${error}`);
        }
      } catch (error) {
        await this.updateSyncStatus(operation.id, 'failed', error.message);
        results.failed++;
        results.items.push({ id: operation.id, status: 'failed', error: error.message });
      }
    }
    
    return results;
  }
  
  // Pull changes from cloud
  async pullChanges(authToken) {
    const db = await getDB();
    const results = { companies: 0, customers: 0, products: 0, invoices: 0 };
    
    const tables = ['companies', 'customers', 'products', 'invoices'];
    
    for (const table of tables) {
      try {
        // Get last sync timestamp for this table
        const meta = await db.select(
          'SELECT last_sync_at FROM sync_metadata WHERE table_name = $1',
          [table]
        );
        
        const lastSync = meta.length > 0 ? meta[0].last_sync_at : null;
        
        // Fetch changes from cloud
        const endpoint = this.getEndpointForTable(table);
        const url = lastSync 
          ? `${API_BASE_URL}${endpoint}?updated_after=${encodeURIComponent(lastSync)}`
          : `${API_BASE_URL}${endpoint}`;
        
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : (data.items || data.data || []);
          
          for (const item of items) {
            await this.upsertLocalRecord(table, item);
          }
          
          results[table] = items.length;
        }
      } catch (error) {
        console.error(`Failed to pull ${table}:`, error);
      }
    }
    
    return results;
  }
  
  // Upsert a record from cloud to local database
  async upsertLocalRecord(tableName, data) {
    const db = await getDB();
    
    // Check for existing record
    const existing = await db.select(
      `SELECT id, version, updated_at FROM ${tableName} WHERE id = $1`,
      [data.id]
    );
    
    if (existing.length > 0) {
      const local = existing[0];
      
      // Conflict resolution
      const hasConflict = local.version !== data.version || 
                         new Date(local.updated_at) > new Date(data.updated_at);
      
      if (hasConflict) {
        switch (this.conflictResolution) {
          case 'remote-wins':
            // Overwrite local with remote
            break;
          case 'local-wins':
            // Keep local, mark for re-sync
            return;
          case 'manual':
            // Store conflict for manual resolution
            await this.storeConflict(tableName, local, data);
            return;
        }
      }
      
      // Update existing record
      const columns = Object.keys(data).filter(k => k !== 'id');
      const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');
      
      await db.execute(
        `UPDATE ${tableName} SET ${setClause}, sync_status = 'synced' WHERE id = $1`,
        [data.id, ...columns.map(col => data[col])]
      );
    } else {
      // Insert new record
      const columns = Object.keys(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      await db.execute(
        `INSERT INTO ${tableName} (${columns.join(', ')}, sync_status) VALUES (${placeholders}, 'synced')`,
        columns.map(col => data[col])
      );
    }
  }
  
  // Update local record ID after cloud sync
  async updateLocalRecordId(tableName, localId, cloudId) {
    const db = await getDB();
    await db.execute(
      `UPDATE ${tableName} SET id = $1, sync_status = 'synced' WHERE id = $2`,
      [cloudId, localId]
    );
  }
  
  // Store conflict for manual resolution
  async storeConflict(tableName, localData, remoteData) {
    const db = await getDB();
    await db.execute(`
      INSERT INTO sync_conflicts (table_name, local_data, remote_data, created_at)
      VALUES ($1, $2, $3, $4)
    `, [tableName, JSON.stringify(localData), JSON.stringify(remoteData), formatISO(new Date())]);
  }
  
  // Update sync metadata
  async updateSyncMetadata() {
    const db = await getDB();
    const tables = ['companies', 'customers', 'products', 'invoices'];
    const now = formatISO(new Date());
    
    for (const table of tables) {
      await db.execute(`
        INSERT INTO sync_metadata (table_name, last_sync_at)
        VALUES ($1, $2)
        ON CONFLICT(table_name) DO UPDATE SET last_sync_at = $2
      `, [table, now]);
    }
  }
  
  // Get endpoint for table
  getEndpointForTable(tableName) {
    const endpoints = {
      'companies': '/company',
      'customers': '/customers',
      'products': '/products',
      'invoices': '/invoices',
      'payments': '/payments'
    };
    return endpoints[tableName] || `/${tableName}`;
  }
  
  // Get sync statistics
  async getSyncStats() {
    const db = await getDB();
    
    const pending = await db.select(`
      SELECT COUNT(*) as count FROM sync_queue WHERE sync_status = 'pending'
    `);
    
    const failed = await db.select(`
      SELECT COUNT(*) as count FROM sync_queue WHERE sync_status = 'failed'
    `);
    
    const lastSync = await db.select(`
      SELECT MAX(last_sync_at) as last_sync FROM sync_metadata
    `);
    
    return {
      pending: pending[0]?.count || 0,
      failed: failed[0]?.count || 0,
      lastSync: lastSync[0]?.last_sync || null
    };
  }
  
  // Schedule periodic sync
  startPeriodicSync(authToken, intervalMinutes = 5) {
    // Initial sync
    this.sync(authToken);
    
    // Schedule periodic sync
    const intervalMs = intervalMinutes * 60 * 1000;
    return setInterval(() => {
      this.sync(authToken);
    }, intervalMs);
  }
}

// Export singleton instance
export const syncService = new SyncService();
