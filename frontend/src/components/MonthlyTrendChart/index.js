import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MonthlyTrendChart.css';

const REGION_COLORS = {
  North: '#5585b5',
  South: '#53a8b6',
  East: '#79c2d0',
  West: '#bbe4e9',
  Central: '#84fab0',
};

const MonthlyTrendChart = () => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [chartType, setChartType] = useState('line');
  const [metric, setMetric] = useState('prescriptions');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchMonthlyTrends();
  }, [filters, selectedProduct, selectedRegion]);

  const fetchMonthlyTrends = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        ...(selectedProduct && { productName: selectedProduct }),
        ...(selectedRegion && { region: selectedRegion }),
      };

      const response = await axios.get(
        'http://localhost:5001/api/reports/monthly-trends',
        { params }
      );

      setTrendData(response.data.monthlyTrends);
      
      // Auto-select first product if none selected
      if (!selectedProduct && response.data.monthlyTrends.products.length > 0) {
        setSelectedProduct(response.data.monthlyTrends.products[0]);
      }
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      toast.error('Failed to fetch monthly trends');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const prepareChartData = () => {
    if (!trendData || !selectedProduct) return [];

    const productData = trendData.chartData[selectedProduct];
    if (!productData) return [];

    // If a specific region is selected, show only that region
    if (selectedRegion) {
      return productData[selectedRegion] || [];
    }

    // Otherwise, combine all regions
    const combinedData = {};
    trendData.regions.forEach(region => {
      const regionData = productData[region] || [];
      regionData.forEach(item => {
        if (!combinedData[item.month]) {
          combinedData[item.month] = { month: item.month };
        }
        combinedData[item.month][`${region}_${metric}`] = item[metric];
      });
    });

    return Object.values(combinedData).sort((a, b) => 
      a.month.localeCompare(b.month)
    );
  };

  const formatMonth = (month) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(year, parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const renderChart = () => {
    const data = prepareChartData();
    if (!data || data.length === 0) {
      return (
        <div className="empty-chart">
          <p>No data available for the selected filters</p>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const renderLines = () => {
      if (selectedRegion) {
        return (
          <Line
            type="monotone"
            dataKey={metric}
            stroke={REGION_COLORS[selectedRegion] || '#5585b5'}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={selectedRegion}
          />
        );
      }
      
      return trendData.regions.map(region => (
        <Line
          key={region}
          type="monotone"
          dataKey={`${region}_${metric}`}
          stroke={REGION_COLORS[region]}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          name={region}
        />
      ));
    };

    const renderAreas = () => {
      if (selectedRegion) {
        return (
          <Area
            type="monotone"
            dataKey={metric}
            stroke={REGION_COLORS[selectedRegion] || '#5585b5'}
            fill={REGION_COLORS[selectedRegion] || '#5585b5'}
            fillOpacity={0.6}
            name={selectedRegion}
          />
        );
      }
      
      return trendData.regions.map((region, index) => (
        <Area
          key={region}
          type="monotone"
          dataKey={`${region}_${metric}`}
          stackId="1"
          stroke={REGION_COLORS[region]}
          fill={REGION_COLORS[region]}
          fillOpacity={0.8}
          name={region}
        />
      ));
    };

    const renderBars = () => {
      if (selectedRegion) {
        return (
          <Bar
            dataKey={metric}
            fill={REGION_COLORS[selectedRegion] || '#5585b5'}
            name={selectedRegion}
          />
        );
      }
      
      return trendData.regions.map(region => (
        <Bar
          key={region}
          dataKey={`${region}_${metric}`}
          fill={REGION_COLORS[region]}
          name={region}
        />
      ));
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={formatMonth}
              formatter={(value) => [value.toFixed(0), '']}
            />
            <Legend />
            {renderAreas()}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={formatMonth}
              formatter={(value) => [value.toFixed(0), '']}
            />
            <Legend />
            {renderBars()}
          </BarChart>
        );
      
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              labelFormatter={formatMonth}
              formatter={(value) => [value.toFixed(0), '']}
            />
            <Legend />
            {selectedRegion ? (
              <>
                <Bar
                  yAxisId="left"
                  dataKey="quantity"
                  fill={REGION_COLORS[selectedRegion] || '#5585b5'}
                  name="Quantity"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ff7300"
                  strokeWidth={2}
                  name="Revenue"
                />
              </>
            ) : (
              trendData.regions.map(region => (
                <Bar
                  key={region}
                  yAxisId="left"
                  dataKey={`${region}_quantity`}
                  fill={REGION_COLORS[region]}
                  name={`${region} Qty`}
                />
              ))
            )}
          </ComposedChart>
        );
      
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={formatMonth}
              formatter={(value) => [value.toFixed(0), '']}
            />
            <Legend />
            {renderLines()}
          </LineChart>
        );
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'prescriptions':
        return 'Prescriptions';
      case 'quantity':
        return 'Quantity Sold';
      case 'revenue':
        return 'Revenue ($)';
      case 'avgOrderValue':
        return 'Avg Order Value ($)';
      default:
        return metric;
    }
  };

  if (loading) {
    return <div className="loading">Loading monthly trends...</div>;
  }

  if (!trendData) {
    return <div className="error-message">Failed to load monthly trends</div>;
  }

  return (
    <div className="monthly-trend-chart">
      <div className="chart-header">
        <h2>Monthly Trend Analysis</h2>
        <div className="chart-subtitle">
          {selectedProduct ? `${selectedProduct} - ${getMetricLabel()}` : 'Select a product'}
        </div>
      </div>

      <div className="chart-controls">
        <div className="control-group">
          <label>Product:</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="form-select"
          >
            <option value="">All Products</option>
            {trendData.products.map(product => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Region:</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="form-select"
          >
            <option value="">All Regions</option>
            {trendData.regions.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Metric:</label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="form-select"
          >
            <option value="prescriptions">Prescriptions</option>
            <option value="quantity">Quantity</option>
            <option value="revenue">Revenue</option>
            <option value="avgOrderValue">Avg Order Value</option>
          </select>
        </div>

        <div className="control-group">
          <label>Chart Type:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="form-select"
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="composed">Composed Chart</option>
          </select>
        </div>
      </div>

      <div className="date-filters">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="form-control"
          placeholder="Start Date"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="form-control"
          placeholder="End Date"
        />
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {trendData.summaryStats && trendData.summaryStats.length > 0 && (
        <div className="summary-stats">
          <h3>Summary Statistics</h3>
          <div className="stats-grid">
            {trendData.summaryStats.slice(0, 6).map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-product">{stat._id.productName}</div>
                <div className="stat-region">{stat._id.region}</div>
                <div className="stat-values">
                  <span>Prescriptions: {stat.totalPrescriptions}</span>
                  <span>Revenue: ${stat.totalRevenue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyTrendChart;