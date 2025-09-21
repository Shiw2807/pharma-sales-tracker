import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, isManager } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    recentSales: [],
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const salesResponse = await axios.get("http://localhost:5001/api/sales");
      const sales = salesResponse.data.sales;

      const totalRevenue = sales.reduce(
        (sum, sale) => sum + sale.totalAmount,
        0
      );
      const averageOrderValue =
        sales.length > 0 ? totalRevenue / sales.length : 0;

      setStats({
        totalSales: sales.length,
        totalRevenue,
        averageOrderValue,
        recentSales: sales.slice(0, 5),
      });

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, "MMM dd");

        const daySales = sales.filter((sale) => {
          const saleDate = new Date(sale.dateOfSale);
          return format(saleDate, "MMM dd") === dateStr;
        });

        last7Days.push({
          date: dateStr,
          sales: daySales.length,
          revenue: daySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        });
      }

      setChartData(last7Days);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p className="role-badge">{user?.role?.replace("_", " ")}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Total Sales</div>
            <div className="stat-value">{stats.totalSales}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Average Order Value</div>
            <div className="stat-value">
              ${stats.averageOrderValue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-label">Your Role</div>
            <div className="stat-value">{user?.role?.replace("_", " ")}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="card">
          <h2>Sales Trend (Last 7 Days)</h2>
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
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Revenue Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#53a8b6" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>Recent Sales</h2>
        {stats.recentSales.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{format(new Date(sale.dateOfSale), "MMM dd, yyyy")}</td>
                    <td>{sale.productName}</td>
                    <td>{sale.customerInfo.name}</td>
                    <td>{sale.quantity}</td>
                    <td>${sale.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${sale.status}`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No sales yet</h3>
            <p>Start by adding your first sale!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;