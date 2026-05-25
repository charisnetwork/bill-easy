import React, { useState, useEffect } from 'react';
import { companyService } from '../services/companyService.js';

const Companies = ({ activeCompany, onCompanySelect, refreshCompanies }) => {
  const [companies, setCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gst_number: '',
    address: '',
    phone: '',
    email: '',
    gst_registered: false
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const data = await companyService.getAll();
    setCompanies(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await companyService.update(editingCompany.id, formData);
      } else {
        await companyService.create(formData);
      }
      await loadCompanies();
      await refreshCompanies();
      resetForm();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      gst_number: company.gst_number || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      gst_registered: !!company.gst_registered
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await companyService.delete(id);
      await loadCompanies();
      await refreshCompanies();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      gst_number: '',
      address: '',
      phone: '',
      email: '',
      gst_registered: false
    });
  };

  return (
    <div className="companies-page">
      <div className="page-header">
        <h1>Companies</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Company
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingCompany ? 'Edit Company' : 'New Company'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name *</label>
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
              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
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
              <div className="form-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.gst_registered}
                    onChange={e => setFormData({...formData, gst_registered: e.target.checked})}
                  />
                  GST Registered
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCompany ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="companies-list">
        {companies.length === 0 ? (
          <p className="empty-message">No companies yet. Create your first company!</p>
        ) : (
          companies.map(company => (
            <div 
              key={company.id} 
              className={`company-card ${activeCompany?.id === company.id ? 'active' : ''}`}
              onClick={() => onCompanySelect(company)}
            >
              <div className="company-info">
                <h3>{company.name}</h3>
                <p>{company.gst_number || 'No GST'}</p>
                <p>{company.address || 'No address'}</p>
                <span className={`sync-badge ${company.sync_status}`}>
                  {company.sync_status}
                </span>
              </div>
              <div className="company-actions">
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleEdit(company); }}>
                  ✏️
                </button>
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }}>
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Companies;
