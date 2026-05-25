import React, { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService.js';
import { customerService } from '../services/customerService.js';
import { productService } from '../services/productService.js';

const Invoices = ({ activeCompany }) => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (activeCompany) {
      loadData();
    }
  }, [activeCompany]);

  const loadData = async () => {
    if (!activeCompany) return;
    const [invData, custData, prodData] = await Promise.all([
      invoiceService.getAll(activeCompany.id),
      customerService.getAll(activeCompany.id),
      productService.getAll(activeCompany.id)
    ]);
    setInvoices(invData);
    setCustomers(custData);
    setProducts(prodData);
  };

  const addItem = (product) => {
    const newItem = {
      product_id: product.id,
      description: product.name,
      hsn_code: product.hsn_code,
      quantity: 1,
      unit: product.unit,
      price: product.sale_price,
      discount_percent: 0,
      discount_amount: 0,
      gst_rate: product.gst_rate,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = parseFloat(value) || 0;
    
    // Recalculate
    const item = updated[index];
    const itemTotal = item.quantity * item.price;
    item.discount_amount = itemTotal * (item.discount_percent / 100);
    item.taxable_amount = itemTotal - item.discount_amount;
    
    const gstAmount = item.taxable_amount * (item.gst_rate / 100);
    item.cgst_amount = gstAmount / 2;
    item.sgst_amount = gstAmount / 2;
    item.total_amount = item.taxable_amount + gstAmount;
    
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let discount = 0;
    let cgst = 0;
    let sgst = 0;
    
    items.forEach(item => {
      subtotal += item.quantity * item.price;
      discount += item.discount_amount;
      cgst += item.cgst_amount;
      sgst += item.sgst_amount;
    });
    
    return {
      subtotal,
      discount,
      taxable: subtotal - discount,
      cgst,
      sgst,
      total: subtotal - discount + cgst + sgst
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || items.length === 0) {
      alert('Please select a customer and add items');
      return;
    }

    try {
      await invoiceService.create({
        company_id: activeCompany.id,
        customer_id: formData.customer_id,
        invoice_date: formData.invoice_date
      }, items);
      
      await loadData();
      setShowForm(false);
      setItems([]);
      setFormData({ customer_id: '', invoice_date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (!activeCompany) {
    return <div className="empty-state">Please select a company first</div>;
  }

  const totals = calculateTotals();

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>Invoices</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Invoice
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay invoice-modal" onClick={() => setShowForm(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <h2>Create Invoice</h2>
            <form onSubmit={handleSubmit}>
              <div className="invoice-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer *</label>
                    <select 
                      value={formData.customer_id}
                      onChange={e => {
                        setFormData({...formData, customer_id: e.target.value});
                        const cust = customers.find(c => c.id === e.target.value);
                        setSelectedCustomer(cust);
                      }}
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input 
                      type="date" 
                      value={formData.invoice_date}
                      onChange={e => setFormData({...formData, invoice_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="product-selector">
                  <label>Add Items:</label>
                  <div className="product-buttons">
                    {products.map(product => (
                      <button 
                        key={product.id} 
                        type="button"
                        className="product-chip"
                        onClick={() => addItem(product)}
                      >
                        + {product.name} (₹{product.sale_price})
                      </button>
                    ))}
                  </div>
                </div>

                {items.length > 0 && (
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Disc%</th>
                        <th>GST%</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.description}</td>
                          <td>
                            <input 
                              type="number" 
                              value={item.quantity}
                              onChange={e => updateItem(idx, 'quantity', e.target.value)}
                              min="1"
                            />
                          </td>
                          <td>₹{item.price}</td>
                          <td>
                            <input 
                              type="number" 
                              value={item.discount_percent}
                              onChange={e => updateItem(idx, 'discount_percent', e.target.value)}
                              min="0"
                              max="100"
                            />
                          </td>
                          <td>{item.gst_rate}%</td>
                          <td>₹{item.total_amount?.toFixed(2)}</td>
                          <td>
                            <button type="button" className="btn-icon" onClick={() => removeItem(idx)}>
                              ❌
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="invoice-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="total-row">
                    <span>Discount:</span>
                    <span>{formatCurrency(totals.discount)}</span>
                  </div>
                  <div className="total-row">
                    <span>CGST:</span>
                    <span>{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="total-row">
                    <span>SGST:</span>
                    <span>{formatCurrency(totals.sgst)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={items.length === 0}>
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Sync</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.invoice_number}</td>
                <td>{inv.customer_name}</td>
                <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                <td>{formatCurrency(inv.total_amount)}</td>
                <td>
                  <span className={`status-badge ${inv.payment_status}`}>
                    {inv.payment_status}
                  </span>
                </td>
                <td>
                  <span className={`sync-badge ${inv.sync_status}`}>
                    {inv.sync_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="empty-message">No invoices yet</p>}
      </div>
    </div>
  );
};

export default Invoices;
