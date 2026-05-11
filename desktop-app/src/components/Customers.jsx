import React, { useState, useEffect } from 'react';
import { customerService } from '../services/customerService.js';

const Customers = ({ activeCompany }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gst_number: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (activeCompany) {
      loadCustomers();
    }
  }, [activeCompany, searchTerm]);

  const loadCustomers = async () => {
    if (!activeCompany) return;
    const data = await customerService.getAll(activeCompany.id, { search: searchTerm });
    setCustomers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await customerService.create({
        ...formData,
        company_id: activeCompany.id
      });
      await loadCustomers();
      setShowForm(false);
      setFormData({ name: '', gst_number: '', phone: '', email: '', address: '' });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this customer?')) {
      await customerService.delete(id);
      await loadCustomers();
    }
  };

  if (!activeCompany) {
    return <div className="empty-state">Please select a company first</div>;
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Customer
        </button>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search customers..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Customer</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input 
                  type="text" 
                  value={formData.gst_number}
                  onChange={e => setFormData({...formData, gst_number: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>GST Number</th>
              <th>Phone</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.gst_number || '-'}</td>
                <td>{customer.phone || '-'}</td>
                <td>₹{customer.balance?.toFixed(2) || '0.00'}</td>
                <td>
                  <span className={`sync-badge ${customer.sync_status}`}>
                    {customer.sync_status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" onClick={() => handleDelete(customer.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="empty-message">No customers found</p>}
      </div>
    </div>
  );
};

export default Customers;
