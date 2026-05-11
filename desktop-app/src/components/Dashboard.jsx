import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService.js';
import { customerService } from '../services/customerService.js';
import { productService } from '../services/productService.js';

const Dashboard = ({ activeCompany }) => {
  const [stats, setStats] = useState({
    todaySales: 0,
    invoiceCount: 0,
    pendingAmount: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCompany) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load stats
        const [invoiceStats, customers, products, lowStock] = await Promise.all([
          invoiceService.getDashboardStats(activeCompany.id, 'today'),
          customerService.getAll(activeCompany.id),
          productService.getAll(activeCompany.id),
          productService.getLowStock(activeCompany.id)
        ]);

        const pendingStats = await invoiceService.getDashboardStats(activeCompany.id);

        setStats({
          todaySales: invoiceStats.totalSales,
          invoiceCount: invoiceStats.invoiceCount,
          pendingAmount: pendingStats.pendingAmount,
          totalCustomers: customers.length,
          totalProducts: products.length,
          lowStockCount: lowStock.length
        });

        // Load recent invoices
        const invoices = await invoiceService.getAll(activeCompany.id, { limit: 5 });
        setRecentInvoices(invoices);
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeCompany]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!activeCompany) {
    return (
      <div className="dashboard empty-state">
        <h2>Welcome to Bill Easy</h2>
        <p>Please create or select a company to get started.</p>
        <button className="btn btn-primary" onClick={() => window.location.hash = 'companies'}>
          Go to Companies
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard - {activeCompany.name}</h1>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Today's Sales</span>
            <span className="stat-value">{formatCurrency(stats.todaySales)}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-label">Invoices Today</span>
            <span className="stat-value">{stats.invoiceCount}</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-info">
            <span className="stat-label">Pending Payments</span>
            <span className="stat-value">{formatCurrency(stats.pendingAmount)}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Customers</span>
            <span className="stat-value">{stats.totalCustomers}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Products</span>
            <span className="stat-value">{stats.totalProducts}</span>
          </div>
        </div>
        
        <div className={`stat-card ${stats.lowStockCount > 0 ? 'danger' : ''}`}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-label">Low Stock Items</span>
            <span className="stat-value">{stats.lowStockCount}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-invoices">
          <div className="section-header">
            <h2>Recent Invoices</h2>
            <button className="btn btn-link">View All</button>
          </div>
          
          {recentInvoices.length === 0 ? (
            <p className="empty-message">No invoices yet. Create your first invoice!</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>
                    <td>{invoice.customer_name}</td>
                    <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td>{formatCurrency(invoice.total_amount)}</td>
                    <td>
                      <span className={`status-badge ${invoice.payment_status}`}>
                        {invoice.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => window.location.hash = 'invoices'}>
              <span>📝</span>
              <label>New Invoice</label>
            </button>
            <button className="action-btn" onClick={() => window.location.hash = 'customers'}>
              <span>👤</span>
              <label>Add Customer</label>
            </button>
            <button className="action-btn" onClick={() => window.location.hash = 'products'}>
              <span>📦</span>
              <label>Add Product</label>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
