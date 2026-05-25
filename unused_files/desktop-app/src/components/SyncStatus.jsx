import React from 'react';

const SyncStatus = ({ status, message, pendingCount }) => {
  if (status === 'idle' && pendingCount === 0) return null;

  const getStatusClass = () => {
    switch (status) {
      case 'syncing': return 'syncing';
      case 'error': return 'error';
      case 'completed': return 'success';
      case 'offline': return 'offline';
      default: return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'syncing': return '🔄';
      case 'error': return '❌';
      case 'completed': return '✅';
      case 'offline': return '📴';
      default: return '⏳';
    }
  };

  return (
    <div className={`sync-status-toast ${getStatusClass()}`}>
      <span className="status-icon">{getStatusIcon()}</span>
      <span className="status-message">{message || status}</span>
      {pendingCount > 0 && (
        <span className="pending-badge">{pendingCount} pending</span>
      )}
    </div>
  );
};

export default SyncStatus;
