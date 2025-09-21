const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Sale = require('../models/Sale');
const User = require('../models/User');
const { authenticate, isAuthorized } = require('../middleware/auth');

// Validation middleware
const validateSale = [
  body('productName').notEmpty().withMessage('Product name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('dateOfSale').optional().isISO8601().withMessage('Invalid date format'),
  body('customerInfo.name').notEmpty().withMessage('Customer name is required')
];

// @route   GET /api/sales/representatives
// @desc    Get all sales representatives (for managers to select when creating sales)
// @access  Private (Managers only)
router.get('/representatives', authenticate, async (req, res) => {
  try {
    // Only managers can get the list of sales representatives
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Manager role required.' });
    }

    const salesReps = await User.find({ role: 'sales_representative' })
      .select('name email _id');

    res.json({
      success: true,
      salesReps
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/sales
// @desc    Get all sales (managers see all, sales reps see their own)
// @access  Private
router.get('/', authenticate, isAuthorized, async (req, res) => {
  try {
    let query = {};
    
    // If user is sales representative, only show their sales
    if (req.user.role === 'sales_representative') {
      query.salesRepresentative = req.user.id;
    }

    // Add filters from query params
    const { startDate, endDate, productName, status } = req.query;
    
    if (startDate || endDate) {
      query.dateOfSale = {};
      if (startDate) query.dateOfSale.$gte = new Date(startDate);
      if (endDate) query.dateOfSale.$lte = new Date(endDate);
    }
    
    if (productName) {
      query.productName = { $regex: productName, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }

    const sales = await Sale.find(query)
      .populate('salesRepresentative', 'name email')
      .sort({ dateOfSale: -1 });

    res.json({
      success: true,
      count: sales.length,
      sales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/sales/:id
// @desc    Get single sale
// @access  Private
router.get('/:id', authenticate, isAuthorized, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('salesRepresentative', 'name email');

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check if sales rep can access this sale
    if (req.user.role === 'sales_representative' && 
        sale.salesRepresentative._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      sale
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/sales
// @desc    Create new sale
// @access  Private (Sales Representatives and Managers)
router.post('/', authenticate, isAuthorized, validateSale, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Determine the sales representative
    let salesRepId;
    
    if (req.user.role === 'manager' && req.body.salesRepresentative) {
      // Manager can assign sale to any sales representative
      salesRepId = req.body.salesRepresentative;
    } else {
      // Sales representatives can only create sales for themselves
      salesRepId = req.user.id;
    }

    const saleData = {
      ...req.body,
      salesRepresentative: salesRepId,
      totalAmount: req.body.quantity * req.body.price  // Calculate totalAmount
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Populate sales representative info
    await sale.populate('salesRepresentative', 'name email');

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      sale
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/sales/:id
// @desc    Update sale
// @access  Private (Sales Representatives can update their own, Managers can update any)
router.put('/:id', authenticate, isAuthorized, validateSale, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check if sales rep can update this sale
    if (req.user.role === 'sales_representative' && 
        sale.salesRepresentative.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update your own sales.' });
    }

    // Update sale
    const updateData = { ...req.body };
    
    // Managers can change the sales representative, sales reps cannot
    if (req.user.role === 'sales_representative') {
      delete updateData.salesRepresentative;
    }
    
    // Recalculate total amount if quantity or price changed
    if (updateData.quantity && updateData.price) {
      updateData.totalAmount = updateData.quantity * updateData.price;
    }

    sale = await Sale.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('salesRepresentative', 'name email');

    res.json({
      success: true,
      message: 'Sale updated successfully',
      sale
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Delete sale
// @access  Private (Sales Representatives can delete their own, Managers can delete any)
router.delete('/:id', authenticate, isAuthorized, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Check if sales rep can delete this sale
    if (req.user.role === 'sales_representative' && 
        sale.salesRepresentative.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own sales.' });
    }

    await sale.deleteOne();

    res.json({
      success: true,
      message: 'Sale deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;