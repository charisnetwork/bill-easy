import React from 'react';

const Header = ({ isOnline, syncState, onSync }) => {
  const getStatusIcon = () => {
    if (syncState.status === 'syncing') return '🔄';
    if (!isOnline) return '📴';
    if (syncState.pendingCount > 0) return '⏳';
    return '✅';
  };

  const getStatusText = () => {
    if (syncState.status === 'syncing') return 'Syncing...';
    if (!isOnline) return 'Offline';
    if (syncState.pendingCount > 0) return `${syncState.pendingCount} pending`;
    return 'Synced';
  };

  return (
    <header className="header">
      <div className="header-search">
        <input type="text" placeholder="Search invoices, customers..." />
      </div>
      
      <div className="header-actions">
        <button 
          className={`sync-btn ${syncState.status === 'syncing' ? 'syncing' : ''}`}
          onClick={onSync}
          disabled={syncState.status === 'syncing' || !isOnline}
          title={syncState.message || 'Sync now'}
        >
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </button>
        
        <button className="notification-btn">
          🔔
          {syncState.pendingCount > 0 && (
            <span className="badge">{syncState.pendingCount}</span>
          )}
        </button>
        
        <div className="user-menu">
          <span>👤 User</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
