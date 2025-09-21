import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import './Reports.css';

const COLORS = ['#5585b5', '#53a8b6', '#79c2d0', '#bbe4e9', '#84fab0', '#8fd3f4'];

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'month'
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const summaryResponse = await axios.get('http://localhost:5001/api/reports/summary', {
        params: filters
      });
      setReportData(summaryResponse.data.report);

      const customersResponse = await axios.get('http://localhost:5001/api/reports/top-customers', {
        params: { ...filters, limit: 5 }
      });
      setTopCustomers(customersResponse.data.topCustomers);

      const performanceResponse = await axios.get('http://localhost:5001/api/reports/performance');
      setPerformance(performanceResponse.data.performance);

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/reports/export', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (!reportData) {
    return <div className="error-message">Failed to load reports</div>;
  }

  return (
    <div className="container">
      <div className="reports-header">
        <h1>Sales Reports & Analytics</h1>
        <button className="btn btn-primary" onClick={handleExport}>
          📥 Export CSV
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            type="date"
            name="startDate"
            className="form-control"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Start Date"
          />
          <input
            type="date"
            name="endDate"
            className="form-control"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="End Date"
          />
          <select
            name="groupBy"
            className="form-select"
            value={filters.groupBy}
            onChange={handleFilterChange}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">{reportData.summary.totalSales}</div>
          {performance && (
            <div className={`stat-change ${performance.growth.salesGrowth >= 0 ? 'positive' : 'negative'}`}>
              {performance.growth.salesGrowth >= 0 ? '↑' : '↓'} {Math.abs(performance.growth.salesGrowth)}%
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">${reportData.summary.totalRevenue.toFixed(2)}</div>
          {performance && (
            <div className={`stat-change ${performance.growth.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
              {performance.growth.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(performance.growth.revenueGrowth)}%
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Quantity Sold</div>
          <div className="stat-value">{reportData.summary.totalQuantity}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Average Order Value</div>
          <div className="stat-value">${reportData.summary.averageOrderValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Time Series Chart */}
        <div className="card">
          <h2>Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="totalSales" stroke="#5585b5" name="Sales Count" />
              <Line yAxisId="right" type="monotone" dataKey="totalRevenue" stroke="#53a8b6" name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Chart */}
        <div className="card">
          <h2>Top Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.productSales.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalRevenue" fill="#5585b5" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Representative */}
        <div className="card">
          <h2>Sales by Representative</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reportData.repSales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry._id.name}: $${entry.totalRevenue.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalRevenue"
              >
                {reportData.repSales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers Table */}
        <div className="card">
          <h2>Top Customers</h2>
          {topCustomers.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Purchases</th>
                  <th>Total Spent</th>
                  <th>Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{customer._id}</strong>
                      {customer.email && <div className="text-small">{customer.email}</div>}
                    </td>
                    <td>{customer.totalPurchases}</td>
                    <td>${customer.totalSpent.toFixed(2)}</td>
                    <td>${customer.averageOrderValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          ) : (
            <p>No customer data available</p>
          )}
        </div>
      </div>

      {/* Performance Comparison */}
      {performance && (
        <div className="card">
          <h2>Performance Comparison</h2>
          <div className="performance-grid">
            <div className="performance-card">
              <h3>{performance.currentPeriod.period}</h3>
              <p>Sales: {performance.currentPeriod.sales}</p>
              <p>Revenue: ${performance.currentPeriod.revenue.toFixed(2)}</p>
            </div>
            <div className="performance-card">
              <h3>{performance.previousPeriod.period}</h3>
              <p>Sales: {performance.previousPeriod.sales}</p>
              <p>Revenue: ${performance.previousPeriod.revenue.toFixed(2)}</p>
            </div>
            <div className="performance-card">
              <h3>Growth</h3>
              <p className={performance.growth.salesGrowth >= 0 ? 'positive' : 'negative'}>
                Sales: {performance.growth.salesGrowth}%
              </p>
              <p className={performance.growth.revenueGrowth >= 0 ? 'positive' : 'negative'}>
                Revenue: {performance.growth.revenueGrowth}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;