const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
  // Unique EMI ID
  emiId: {
    type: String,
    required: true,
    unique: true
  },
  
  // References
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  
  // EMI details
  installmentNo: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  
  // Payment details (when paid)
  paidDate: {
    type: Date
  },
  paidAmount: {
    type: String
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Online', 'Bank Transfer', '']
  },
  transactionId: {
    type: String
  },
  
  // Late payment details
  lateFee: {
    type: String,
    default: '0'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
emiSchema.index({ emiId: 1 }, { unique: true });
emiSchema.index({ saleId: 1 });
emiSchema.index({ customerId: 1 });
emiSchema.index({ status: 1 });
emiSchema.index({ dueDate: 1 });

module.exports = mongoose.model('EMI', emiSchema);