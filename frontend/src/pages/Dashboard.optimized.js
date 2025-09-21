import React, { useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import DataTable from '../components/common/DataTable';
import API_URL from '../config/api';
import './Dashboard.css';

const StatCard = React.memo(({ icon, label, value }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
));

const ChartCard = React.memo(({ title, children }) => (
  <div className="card">
    <h2>{title}</h2>
    {children}
  </div>
));

const Dashboard = () => {
  const { user } = useAuth();
  const { data: salesData, loading } = useApi(`${API_URL}/api/sales`);

  const stats = useMemo(() => {
    if (!salesData?.sales) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        recentSales: []
      };
    }

    const sales = salesData.sales;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const averageOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

    return {
      totalSales: sales.length,
      totalRevenue,
      averageOrderValue,
      recentSales: sales.slice(0, 5)
    };
  }, [salesData]);

  const chartData = useMemo(() => {
    if (!salesData?.sales) return [];

    const last7Days = [];
    const sales = salesData.sales;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'MMM dd');
      
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.dateOfSale);
        return format(saleDate, 'MMM dd') === dateStr;
      });

      last7Days.push({
        date: dateStr,
        sales: daySales.length,
        revenue: daySales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      });
    }
    
    return last7Days;
  }, [salesData]);

  const tableColumns = useMemo(() => [
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
      render: (value) => value.name
    },
    {
      key: 'quantity',
      label: 'Quantity'
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`status-badge status-${value}`}>
          {value}
        </span>
      )
    }
  ], []);

  // Format currency with memoization
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p className="role-badge">{user?.role?.replace('_', ' ')}</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          icon="📊" 
          label="Total Sales" 
          value={stats.totalSales} 
        />
        <StatCard 
          icon="💰" 
          label="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
        />
        <StatCard 
          icon="📈" 
          label="Average Order Value" 
          value={formatCurrency(stats.averageOrderValue)} 
        />
        <StatCard 
          icon="👤" 
          label="Your Role" 
          value={user?.role?.replace('_', ' ')} 
        />
      </div>

      <div className="dashboard-charts">
        <ChartCard title="Sales Trend (Last 7 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#5585b5" 
                name="Sales Count" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend (Last 7 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#53a8b6" 
                name="Revenue ($)" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="card">
        <h2>Recent Sales</h2>
        {stats.recentSales.length > 0 ? (
          <DataTable 
            columns={tableColumns}
            data={stats.recentSales}
            responsive={true}
          />
        ) : (
          <EmptyState 
            icon="📦"
            title="No sales yet"
            message="Start by adding your first sale!"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;