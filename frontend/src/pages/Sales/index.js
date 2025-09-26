import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import SaleForm from "../../components/SaleForm";
import "./Sales.css";

const Sales = () => {
  const { user, isManager } = useAuth();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [filters, setFilters] = useState({
    productName: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, filters]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/sales");
      setSales(response.data.sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sales];

    if (filters.productName) {
      filtered = filtered.filter((sale) =>
        sale.productName
          .toLowerCase()
          .includes(filters.productName.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((sale) => sale.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.dateOfSale) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.dateOfSale) <= new Date(filters.endDate)
      );
    }

    setFilteredSales(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/sales/${id}`);
      toast.success("Sale deleted successfully");
      fetchSales();
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale");
    }
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchSales();
  };

  const canEditDelete = (sale) => {
    return isManager || sale.salesRepresentative._id === user?.id;
  };

  if (loading) {
    return <div className="loading">Loading sales...</div>;
  }

  return (
    <div className="container">
      <div className="sales-header">
        <h1>Sales Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add New Sale
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            type="text"
            name="productName"
            className="form-control"
            placeholder="Search by product..."
            value={filters.productName}
            onChange={handleFilterChange}
          />
          <input
            type="date"
            name="startDate"
            className="form-control"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
          <input
            type="date"
            name="endDate"
            className="form-control"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
          <select
            name="status"
            className="form-select"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredSales.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  {isManager && <th>Sales Rep</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{format(new Date(sale.dateOfSale), "MMM dd, yyyy")}</td>
                    <td>{sale.productName}</td>
                    <td>
                      <div>
                        <strong>{sale.customerInfo.name}</strong>
                        {sale.customerInfo.email && (
                          <div className="text-small">
                            {sale.customerInfo.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{sale.quantity}</td>
                    <td>${sale.price.toFixed(2)}</td>
                    <td>
                      <strong>${sale.totalAmount.toFixed(2)}</strong>
                    </td>
                    {isManager && (
                      <td>{sale.salesRepresentative?.name || "N/A"}</td>
                    )}
                    <td>
                      <span className={`status-badge status-${sale.status}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td>
                      {canEditDelete(sale) && (
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEdit(sale)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(sale._id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No sales found</h3>
            <p>Try adjusting your filters or add a new sale.</p>
          </div>
        )}
      </div>

      {showForm && (
        <SaleForm
          sale={editingSale}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};
export default Sales;
