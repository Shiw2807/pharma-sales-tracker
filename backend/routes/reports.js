const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { authenticate, isManager } = require('../middleware/auth');

// @route   GET /api/reports/summary
// @desc    Get sales summary report
// @access  Private (Managers only)
router.get('/summary', authenticate, isManager, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.dateOfSale = {};
      if (startDate) matchQuery.dateOfSale.$gte = new Date(startDate);
      if (endDate) matchQuery.dateOfSale.$lte = new Date(endDate);
    }

    // Get overall summary
    const summary = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalQuantity: { $sum: '$quantity' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get sales by product
    const productSales = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$productName',
          totalSales: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    // Get sales by representative
    const repSales = await Sale.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'salesRepresentative',
          foreignField: '_id',
          as: 'rep'
        }
      },
      { $unwind: '$rep' },
      {
        $group: {
          _id: {
            id: '$rep._id',
            name: '$rep.name',
            email: '$rep.email'
          },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Get time-based sales (daily/weekly/monthly)
    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$dateOfSale' } };
        break;
      case 'week':
        dateFormat = { 
          $dateToString: { 
            format: '%Y-W%V', 
            date: '$dateOfSale' 
          } 
        };
        break;
      case 'month':
      default:
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$dateOfSale' } };
        break;
    }

    const timeSeries = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      report: {
        summary: summary[0] || {
          totalSales: 0,
          totalRevenue: 0,
          totalQuantity: 0,
          averageOrderValue: 0
        },
        productSales,
        repSales,
        timeSeries,
        filters: {
          startDate,
          endDate,
          groupBy
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/top-customers
// @desc    Get top customers report
// @access  Private (Managers only)
router.get('/top-customers', authenticate, isManager, async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    console.log('hi')

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.dateOfSale = {};
      if (startDate) matchQuery.dateOfSale.$gte = new Date(startDate);
      if (endDate) matchQuery.dateOfSale.$lte = new Date(endDate);
    }

    const topCustomers = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$customerInfo.name',
          email: { $first: '$customerInfo.email' },
          phone: { $first: '$customerInfo.phone' },
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      topCustomers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/performance
// @desc    Get sales performance metrics
// @access  Private (Managers only)
router.get('/performance', authenticate, isManager, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - daysAgo);
    
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysAgo * 2));
    
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - daysAgo);

    // Current period metrics
    const currentMetrics = await Sale.aggregate([
      { $match: { dateOfSale: { $gte: currentPeriodStart } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Previous period metrics
    const previousMetrics = await Sale.aggregate([
      { 
        $match: { 
          dateOfSale: { 
            $gte: previousPeriodStart,
            $lt: previousPeriodEnd
          } 
        } 
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const current = currentMetrics[0] || { totalSales: 0, totalRevenue: 0 };
    const previous = previousMetrics[0] || { totalSales: 0, totalRevenue: 0 };

    // Calculate growth percentages
    const salesGrowth = previous.totalSales > 0 
      ? ((current.totalSales - previous.totalSales) / previous.totalSales) * 100 
      : 0;
    
    const revenueGrowth = previous.totalRevenue > 0 
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
      : 0;

    res.json({
      success: true,
      performance: {
        currentPeriod: {
          sales: current.totalSales,
          revenue: current.totalRevenue,
          period: `Last ${daysAgo} days`
        },
        previousPeriod: {
          sales: previous.totalSales,
          revenue: previous.totalRevenue,
          period: `Previous ${daysAgo} days`
        },
        growth: {
          salesGrowth: salesGrowth.toFixed(2),
          revenueGrowth: revenueGrowth.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/monthly-trends
// @desc    Get monthly trends by drug and region
// @access  Private (Managers only)
router.get('/monthly-trends', authenticate, isManager, async (req, res) => {
  try {
    const { startDate, endDate, region, productName } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.dateOfSale = {};
      if (startDate) matchQuery.dateOfSale.$gte = new Date(startDate);
      if (endDate) matchQuery.dateOfSale.$lte = new Date(endDate);
    }
    if (region) matchQuery.region = region;
    if (productName) matchQuery.productName = productName;

    // Get monthly trends grouped by drug and region
    const monthlyTrends = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$dateOfSale' } },
            productName: '$productName',
            region: '$region'
          },
          totalPrescriptions: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.month': 1, '_id.region': 1, '_id.productName': 1 } }
    ]);

    // Get unique products and regions for filtering
    const products = await Sale.distinct('productName', matchQuery);
    const regions = await Sale.distinct('region', matchQuery);

    // Transform data for chart consumption
    const chartData = {};
    const monthsSet = new Set();
    
    monthlyTrends.forEach(item => {
      const { month, productName, region } = item._id;
      monthsSet.add(month);
      
      if (!chartData[productName]) {
        chartData[productName] = {};
      }
      if (!chartData[productName][region]) {
        chartData[productName][region] = {};
      }
      
      chartData[productName][region][month] = {
        prescriptions: item.totalPrescriptions,
        quantity: item.totalQuantity,
        revenue: item.totalRevenue,
        avgOrderValue: item.averageOrderValue
      };
    });

    // Fill missing months with zero values
    const months = Array.from(monthsSet).sort();
    const filledChartData = {};
    
    Object.keys(chartData).forEach(product => {
      filledChartData[product] = {};
      regions.forEach(region => {
        filledChartData[product][region] = [];
        months.forEach(month => {
          const data = chartData[product]?.[region]?.[month] || {
            prescriptions: 0,
            quantity: 0,
            revenue: 0,
            avgOrderValue: 0
          };
          filledChartData[product][region].push({
            month,
            ...data
          });
        });
      });
    });

    // Calculate summary statistics
    const summaryStats = await Sale.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            productName: '$productName',
            region: '$region'
          },
          totalPrescriptions: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgMonthlyPrescriptions: { $avg: '$quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      monthlyTrends: {
        chartData: filledChartData,
        rawData: monthlyTrends,
        months,
        products,
        regions,
        summaryStats,
        filters: {
          startDate,
          endDate,
          region,
          productName
        }
      }
    });
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/reports/export
// @desc    Export sales data as CSV
// @access  Private (Managers only)
router.get('/export', authenticate, isManager, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.dateOfSale = {};
      if (startDate) matchQuery.dateOfSale.$gte = new Date(startDate);
      if (endDate) matchQuery.dateOfSale.$lte = new Date(endDate);
    }

    const sales = await Sale.find(matchQuery)
      .populate('salesRepresentative', 'name email')
      .sort({ dateOfSale: -1 });

    // Convert to CSV format
    const csvHeader = 'Date,Product,Quantity,Price,Total,Customer,Email,Phone,Region,Sales Rep,Status\n';
    const csvData = sales.map(sale => {
      return `${sale.dateOfSale.toISOString().split('T')[0]},${sale.productName},${sale.quantity},${sale.price},${sale.totalAmount},"${sale.customerInfo.name}","${sale.customerInfo.email || ''}","${sale.customerInfo.phone || ''}",${sale.region || 'N/A'},"${sale.salesRepresentative.name}",${sale.status}`;
    }).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;