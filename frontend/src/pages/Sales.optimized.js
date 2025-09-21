import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { useApi, useApiMutation } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import DataTable from '../components/common/DataTable';
import API_URL from '../config/api';
import './Sales.css';

// Lazy load the SaleForm modal
const SaleForm = lazy(() => import('../components/SaleForm'));

const SalesFilter = React.memo(({ filters, onChange }) => {
  return (
    <div className="filter-bar">
      <input
        type="text"
        name="productName"
        className="form-control"
        placeholder="Search by product..."
        value={filters.productName}
        onChange={onChange}
      />
      <input
        type="date"
        name="startDate"
        className="form-control"
        value={filters.startDate}
        onChange={onChange}
      />
      <input
        type="date"
        name="endDate"
        className="form-control"
        value={filters.endDate}
        onChange={onChange}
      />
      <select
        name="status"
        className="form-select"
        value={filters.status}
        onChange={onChange}
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
});

const Sales = () => {
  const { user, isManager } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [filters, setFilters] = useState({
    productName: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  const debouncedProductName = useDebounce(filters.productName, 300);

  const { data: salesData, loading, refetch } = useApi(`${API_URL}/api/sales`);
  const { mutate: deleteSale, loading: deleting } = useApiMutation(`${API_URL}/api/sales`, 'DELETE');

  const filteredSales = useMemo(() => {
    if (!salesData?.sales) return [];
    
    let filtered = [...salesData.sales];

    if (debouncedProductName) {
      filtered = filtered.filter(sale => 
        sale.productName.toLowerCase().includes(debouncedProductName.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(sale => sale.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(sale => 
        new Date(sale.dateOfSale) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(sale => 
        new Date(sale.dateOfSale) <= new Date(filters.endDate)
      );
    }

    return filtered;
  }, [salesData, debouncedProductName, filters.status, filters.startDate, filters.endDate]);

  // Handlers
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) {
      return;
    }

    try {
      await deleteSale(null, {
        url: `${API_URL}/api/sales/${id}`,
        method: 'DELETE',
        successMessage: 'Sale deleted successfully'
      });
      refetch();
    } catch (error) {
    }
  }, [deleteSale, refetch]);

  const handleEdit = useCallback((sale) => {
    setEditingSale(sale);
    setShowForm(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditingSale(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    handleFormClose();
    refetch();
  }, [handleFormClose, refetch]);

  const canEditDelete = useCallback((sale) => {
    return isManager || sale.salesRepresentative._id === user?.id;
  }, [isManager, user]);

  const columns = useMemo(() => [
    {
      key: 'dateOfSale',
      label: 'Date',
      render: (value) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'productName',
      label: 'Product'
    },
    {
      key: 'customerInfo',
      label: 'Customer',
      render: (value) => (
        <div>
          <strong>{value.name}</strong>
          {value.email && <div className="text-small">{value.email}</div>}
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity'
    },
    {
      key: 'price',
      label: 'Price',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (value) => <strong>${value.toFixed(2)}</strong>
    },
    ...(isManager ? [{
      key: 'salesRepresentative',
      label: 'Sales Rep',
      render: (value) => value?.name || 'N/A'
    }] : []),
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => canEditDelete(row) && (
        <div className="action-buttons">
          <button
            className="btn-action btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            title="Edit"
            disabled={deleting}
          >
            ✏️
          </button>
          <button
            className="btn-action btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            title="Delete"
            disabled={deleting}
          >
            🗑️
          </button>
        </div>
      )
    }
  ], [isManager, canEditDelete, handleEdit, handleDelete, deleting]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading sales..." />;
  }

  return (
    <div className="container">
      <div className="sales-header">
        <h1>Sales Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New Sale
        </button>
      </div>

      <div className="card">
        <SalesFilter 
          filters={filters} 
          onChange={handleFilterChange} 
        />

        {filteredSales.length > 0 ? (
          <DataTable 
            columns={columns}
            data={filteredSales}
            responsive={true}
          />
        ) : (
          <EmptyState 
            icon="📋"
            title="No sales found"
            message="Try adjusting your filters or add a new sale."
            action={
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                Add First Sale
              </button>
            }
          />
        )}
      </div>

      {showForm && (
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <SaleForm
            sale={editingSale}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Sales;