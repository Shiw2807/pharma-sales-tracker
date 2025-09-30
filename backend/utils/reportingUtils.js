/**
 * Reporting utilities for handling data aggregation and edge cases
 */

/**
 * Fill missing months in a time series dataset
 * @param {Array} data - Array of data points with month field
 * @param {String} startDate - Start date for the range
 * @param {String} endDate - End date for the range
 * @returns {Array} - Array with all months filled
 */
const fillMissingMonths = (data, startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date(data[0]?.month || new Date());
  const end = endDate ? new Date(endDate) : new Date();
  
  const months = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
    current.setMonth(current.getMonth() + 1);
  }
  
  const dataMap = new Map(data.map(item => [item.month, item]));
  
  return months.map(month => {
    return dataMap.get(month) || {
      month,
      prescriptions: 0,
      quantity: 0,
      revenue: 0,
      avgOrderValue: 0
    };
  });
};

/**
 * Calculate month-over-month growth
 * @param {Array} data - Time series data
 * @returns {Array} - Data with growth percentages added
 */
const calculateMonthlyGrowth = (data) => {
  return data.map((item, index) => {
    if (index === 0) {
      return { ...item, growth: 0 };
    }
    
    const previous = data[index - 1];
    const growth = previous.revenue > 0 
      ? ((item.revenue - previous.revenue) / previous.revenue) * 100 
      : 0;
    
    return { ...item, growth: growth.toFixed(2) };
  });
};

/**
 * Aggregate data by region
 * @param {Array} sales - Array of sales records
 * @returns {Object} - Data aggregated by region
 */
const aggregateByRegion = (sales) => {
  const regionData = {};
  
  sales.forEach(sale => {
    const region = sale.region || 'Unknown';
    if (!regionData[region]) {
      regionData[region] = {
        totalSales: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        products: new Set()
      };
    }
    
    regionData[region].totalSales += 1;
    regionData[region].totalRevenue += sale.totalAmount;
    regionData[region].totalQuantity += sale.quantity;
    regionData[region].products.add(sale.productName);
  });
  
  // Convert Sets to arrays for product counts
  Object.keys(regionData).forEach(region => {
    regionData[region].uniqueProducts = regionData[region].products.size;
    regionData[region].products = Array.from(regionData[region].products);
  });
  
  return regionData;
};

/**
 * Calculate rolling averages for smoothing trends
 * @param {Array} data - Time series data
 * @param {Number} window - Window size for rolling average
 * @returns {Array} - Data with rolling averages added
 */
const calculateRollingAverage = (data, window = 3) => {
  return data.map((item, index) => {
    const start = Math.max(0, index - Math.floor(window / 2));
    const end = Math.min(data.length, index + Math.ceil(window / 2));
    const windowData = data.slice(start, end);
    
    const avgRevenue = windowData.reduce((sum, d) => sum + d.revenue, 0) / windowData.length;
    const avgPrescriptions = windowData.reduce((sum, d) => sum + d.prescriptions, 0) / windowData.length;
    
    return {
      ...item,
      rollingAvgRevenue: avgRevenue.toFixed(2),
      rollingAvgPrescriptions: avgPrescriptions.toFixed(0)
    };
  });
};

/**
 * Identify top performing products by region
 * @param {Array} sales - Array of sales records
 * @param {Number} limit - Number of top products to return
 * @returns {Object} - Top products by region
 */
const getTopProductsByRegion = (sales, limit = 5) => {
  const regionProducts = {};
  
  // Group by region and product
  sales.forEach(sale => {
    const region = sale.region || 'Unknown';
    const product = sale.productName;
    
    if (!regionProducts[region]) {
      regionProducts[region] = {};
    }
    
    if (!regionProducts[region][product]) {
      regionProducts[region][product] = {
        name: product,
        totalSales: 0,
        totalRevenue: 0,
        totalQuantity: 0
      };
    }
    
    regionProducts[region][product].totalSales += 1;
    regionProducts[region][product].totalRevenue += sale.totalAmount;
    regionProducts[region][product].totalQuantity += sale.quantity;
  });
  
  // Sort and limit products per region
  const topProducts = {};
  Object.keys(regionProducts).forEach(region => {
    topProducts[region] = Object.values(regionProducts[region])
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  });
  
  return topProducts;
};

/**
 * Calculate seasonal trends
 * @param {Array} sales - Array of sales records
 * @returns {Object} - Seasonal analysis
 */
const analyzeSeasonalTrends = (sales) => {
  const seasons = {
    'Q1': { months: [1, 2, 3], sales: 0, revenue: 0 },
    'Q2': { months: [4, 5, 6], sales: 0, revenue: 0 },
    'Q3': { months: [7, 8, 9], sales: 0, revenue: 0 },
    'Q4': { months: [10, 11, 12], sales: 0, revenue: 0 }
  };
  
  sales.forEach(sale => {
    const month = new Date(sale.dateOfSale).getMonth() + 1;
    const quarter = Object.keys(seasons).find(q => 
      seasons[q].months.includes(month)
    );
    
    if (quarter) {
      seasons[quarter].sales += 1;
      seasons[quarter].revenue += sale.totalAmount;
    }
  });
  
  // Calculate percentages
  const totalRevenue = Object.values(seasons).reduce((sum, q) => sum + q.revenue, 0);
  const totalSales = Object.values(seasons).reduce((sum, q) => sum + q.sales, 0);
  
  Object.keys(seasons).forEach(quarter => {
    seasons[quarter].revenuePercentage = totalRevenue > 0 
      ? ((seasons[quarter].revenue / totalRevenue) * 100).toFixed(2)
      : 0;
    seasons[quarter].salesPercentage = totalSales > 0 
      ? ((seasons[quarter].sales / totalSales) * 100).toFixed(2)
      : 0;
  });
  
  return seasons;
};

/**
 * Format currency values consistently
 * @param {Number} value - Numeric value to format
 * @param {String} currency - Currency code (default: USD)
 * @returns {String} - Formatted currency string
 */
const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Generate date range for queries
 * @param {String} period - Period identifier (e.g., 'last30days', 'thisMonth', 'thisYear')
 * @returns {Object} - Start and end dates
 */
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'last7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'last30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'thisQuarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    case 'lastYear':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
  }
  
  return { startDate, endDate };
};

module.exports = {
  fillMissingMonths,
  calculateMonthlyGrowth,
  aggregateByRegion,
  calculateRollingAverage,
  getTopProductsByRegion,
  analyzeSeasonalTrends,
  formatCurrency,
  getDateRange
};