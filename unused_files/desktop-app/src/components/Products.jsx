import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService.js';

const Products = ({ activeCompany }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsn_code: '',
    sku: '',
    unit: 'pcs',
    sale_price: '',
    purchase_price: '',
    gst_rate: '',
    opening_stock: '',
    min_stock_level: ''
  });

  useEffect(() => {
    if (activeCompany) {
      loadProducts();
    }
  }, [activeCompany, searchTerm, showLowStock]);

  const loadProducts = async () => {
    if (!activeCompany) return;
    
    let data;
    if (showLowStock) {
      data = await productService.getLowStock(activeCompany.id);
    } else {
      data = await productService.getAll(activeCompany.id, { search: searchTerm });
    }
    setProducts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productService.create({
        ...formData,
        company_id: activeCompany.id,
        sale_price: parseFloat(formData.sale_price) || 0,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        gst_rate: parseFloat(formData.gst_rate) || 0,
        opening_stock: parseFloat(formData.opening_stock) || 0,
        min_stock_level: parseFloat(formData.min_stock_level) || 0
      });
      await loadProducts();
      setShowForm(false);
      setFormData({
        name: '', description: '', hsn_code: '', sku: '', unit: 'pcs',
        sale_price: '', purchase_price: '', gst_rate: '',
        opening_stock: '', min_stock_level: ''
      });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await productService.delete(id);
      await loadProducts();
    }
  };

  if (!activeCompany) {
    return <div className="empty-state">Please select a company first</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Product
        </button>
      </div>

      <div className="filters">
        <input 
          type="text" 
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <label className="checkbox">
          <input 
            type="checkbox" 
            checked={showLowStock}
            onChange={e => setShowLowStock(e.target.checked)}
          />
          Show Low Stock Only
        </label>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Product</h2>
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
              <div className="form-row">
                <div className="form-group">
                  <label>HSN Code</label>
                  <input 
                    type="text" 
                    value={formData.hsn_code}
                    onChange={e => setFormData({...formData, hsn_code: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input 
                    type="text" 
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sale Price *</label>
                  <input 
                    type="number" 
                    value={formData.sale_price}
                    onChange={e => setFormData({...formData, sale_price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Purchase Price</label>
                  <input 
                    type="number" 
                    value={formData.purchase_price}
                    onChange={e => setFormData({...formData, purchase_price: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>GST Rate (%)</label>
                  <input 
                    type="number" 
                    value={formData.gst_rate}
                    onChange={e => setFormData({...formData, gst_rate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Opening Stock</label>
                  <input 
                    type="number" 
                    value={formData.opening_stock}
                    onChange={e => setFormData({...formData, opening_stock: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Min Stock Level</label>
                <input 
                  type="number" 
                  value={formData.min_stock_level}
                  onChange={e => setFormData({...formData, min_stock_level: e.target.value})}
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
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>GST %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className={product.current_stock <= product.min_stock_level ? 'low-stock' : ''}>
                <td>{product.name}</td>
                <td>{product.sku || '-'}</td>
                <td>₹{product.sale_price?.toFixed(2)}</td>
                <td>
                  {product.current_stock}
                  {product.current_stock <= product.min_stock_level && (
                    <span className="stock-warning">⚠️ Low</span>
                  )}
                </td>
                <td>{product.gst_rate}%</td>
                <td>
                  <button className="btn-icon" onClick={() => handleDelete(product.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="empty-message">No products found</p>}
      </div>
    </div>
  );
};

export default Products;
