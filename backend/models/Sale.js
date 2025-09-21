const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative']
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  dateOfSale: {
    type: Date,
    required: [true, 'Please provide date of sale'],
    default: Date.now
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Please provide customer name'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  salesRepresentative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total amount before saving
SaleSchema.pre('save', function(next) {
  this.totalAmount = this.quantity * this.price;
  this.updatedAt = Date.now();
  next();
});

// Update updatedAt on update
SaleSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Sale', SaleSchema);