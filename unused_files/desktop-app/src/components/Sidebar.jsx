import React from 'react';

const Sidebar = ({ currentPage, onNavigate, companies, activeCompany, onCompanyChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'invoices', label: 'Invoices', icon: '📝' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'companies', label: 'Companies', icon: '🏢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">B</div>
          <span className="logo-text">Bill Easy</span>
        </div>
        <span className="offline-badge">Offline-First</span>
      </div>
      
      {activeCompany && (
        <div className="company-selector">
          <select 
            value={activeCompany.id} 
            onChange={(e) => {
              const company = companies.find(c => c.id === e.target.value);
              if (company) onCompanyChange(company);
            }}
          >
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <p>v2.0.0 - Offline Mode</p>
      </div>
    </aside>
  );
};

export default Sidebar;
