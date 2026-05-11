import React, { useState, useEffect } from 'react';
import { syncService } from '../services/syncService.js';
import { resetDatabase } from '../services/database.js';

const Settings = ({ authToken, setAuthToken }) => {
  const [syncStats, setSyncStats] = useState({ pending: 0, failed: 0, lastSync: null });
  const [token, setToken] = useState(authToken || '');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSyncStats();
  }, []);

  const loadSyncStats = async () => {
    const stats = await syncService.getSyncStats();
    setSyncStats(stats);
  };

  const handleSaveToken = () => {
    setAuthToken(token);
    localStorage.setItem('auth_token', token);
    alert('Authentication token saved');
  };

  const handleManualSync = async () => {
    if (!token) {
      alert('Please enter authentication token first');
      return;
    }
    setSyncing(true);
    await syncService.sync(token);
    await loadSyncStats();
    setSyncing(false);
  };

  const handleResetDatabase = async () => {
    if (confirm('WARNING: This will delete all local data. Are you sure?')) {
      await resetDatabase();
      alert('Database reset. Please restart the app.');
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Cloud Sync</h2>
        
        <div className="sync-stats">
          <div className="stat-box">
            <span className="stat-label">Pending Changes</span>
            <span className="stat-value">{syncStats.pending}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Failed Syncs</span>
            <span className="stat-value">{syncStats.failed}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Last Sync</span>
            <span className="stat-value">
              {syncStats.lastSync ? new Date(syncStats.lastSync).toLocaleString() : 'Never'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label>Authentication Token</label>
          <input 
            type="password" 
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Enter your API token"
          />
          <small>Required for cloud synchronization</small>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleSaveToken}>
            Save Token
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleManualSync}
            disabled={syncing || !token}
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2>Data Management</h2>
        <p>Reset local database. This will delete all local data but won't affect cloud data.</p>
        <button className="btn btn-danger" onClick={handleResetDatabase}>
          Reset Local Database
        </button>
      </div>

      <div className="settings-section">
        <h2>About</h2>
        <div className="about-info">
          <p><strong>Bill Easy Desktop</strong></p>
          <p>Version: 2.0.0</p>
          <p>Architecture: Offline-First</p>
          <p>Database: SQLite (Local)</p>
          <p>Sync: Cloud-capable with queue</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
