// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  emiId: { type: mongoose.Schema.Types.ObjectId, ref: 'EMI' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['created', 'attempted', 'paid', 'failed'], default: 'created' },
  paymentMethod: { type: String },
  razorpaySignature: { type: String },
  failureReason: { type: String },
  paymentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);