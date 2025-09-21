import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';
import './SaleForm.css';

const SaleForm = ({ sale, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    productName: '',
    quantity: 1,
    price: 0,
    dateOfSale: new Date().toISOString().split('T')[0],
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    status: 'completed',
    notes: '',
    salesRepresentative: ''
  });
  const [loading, setLoading] = useState(false);
  const [salesReps, setSalesReps] = useState([]);

  useEffect(() => {
    if (sale) {
      setFormData({
        productName: sale.productName,
        quantity: sale.quantity,
        price: sale.price,
        dateOfSale: new Date(sale.dateOfSale).toISOString().split('T')[0],
        customerInfo: sale.customerInfo,
        status: sale.status,
        notes: sale.notes || '',
        salesRepresentative: sale.salesRepresentative?._id || sale.salesRepresentative || ''
      });
    }
    
    // Fetch sales representatives if user is a manager
    if (user?.role === 'manager') {
      fetchSalesReps();
    }
  }, [sale, user]);

  const fetchSalesReps = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sales/representatives`);
      setSalesReps(response.data.salesReps);
    } catch (error) {
      console.error('Error fetching sales representatives:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('customer.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        customerInfo: {
          ...formData.customerInfo,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (sale) {
        // Update existing sale
        await axios.put(`${API_URL}/api/sales/${sale._id}`, formData);
        toast.success('Sale updated successfully');
      } else {
        // Create new sale
        await axios.post(`${API_URL}/api/sales`, formData);
        toast.success('Sale created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving sale:', error);
      const message = error.response?.data?.message || 'Failed to save sale';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{sale ? 'Edit Sale' : 'Add New Sale'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {user?.role === 'manager' && !sale && (
            <div className="form-group">
              <label className="form-label">Sales Representative *</label>
              <select
                name="salesRepresentative"
                className="form-select"
                value={formData.salesRepresentative}
                onChange={handleChange}
                required
              >
                <option value="">Select a sales representative</option>
                {salesReps.map(rep => (
                  <option key={rep._id} value={rep._id}>
                    {rep.name} ({rep.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {user?.role === 'manager' && sale && (
            <div className="form-group">
              <label className="form-label">Sales Representative</label>
              <select
                name="salesRepresentative"
                className="form-select"
                value={formData.salesRepresentative}
                onChange={handleChange}
              >
                {salesReps.map(rep => (
                  <option key={rep._id} value={rep._id}>
                    {rep.name} ({rep.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="productName"
                className="form-control"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Sale *</label>
              <input
                type="date"
                name="dateOfSale"
                className="form-control"
                value={formData.dateOfSale}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantity"
                className="form-control"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price per Unit *</label>
              <input
                type="number"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <h3>Customer Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                name="customer.name"
                className="form-control"
                value={formData.customerInfo.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="customer.email"
                className="form-control"
                value={formData.customerInfo.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="customer.phone"
                className="form-control"
                value={formData.customerInfo.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="customer.address"
                className="form-control"
                value={formData.customerInfo.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-control"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about this sale..."
            />
          </div>

          <div className="form-total">
            <strong>Total Amount: ${(formData.quantity * formData.price).toFixed(2)}</strong>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (sale ? 'Update Sale' : 'Create Sale')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;