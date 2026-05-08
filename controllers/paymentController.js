// controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const EMI = require('../models/EMI');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { emiId, customerId, amount } = req.body;

    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Validate EMI if provided
    if (emiId) {
      const emi = await EMI.findById(emiId);
      if (!emi) {
        return res.status(404).json({ success: false, message: 'EMI record not found' });
      }
      if (emi.status === 'Paid') {
        return res.status(400).json({ success: false, message: 'This EMI has already been paid' });
      }
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerId: customerId.toString(),
        emiId: emiId || '',
        customerEmail: customer.email,
        customerPhone: customer.phone
      }
    };

    const order = await razorpay.orders.create(options);

    // Save payment record
    const payment = new Payment({
      paymentId: `pay_${Date.now()}`,
      orderId: order.id,
      customerId,
      emiId: emiId || null,
      amount: amount,
      status: 'created'
    });

    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, emiId, customerId } = req.body;

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === signature;

    if (!isAuthentic) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { orderId },
        { status: 'failed', failureReason: 'Invalid signature' }
      );
      
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        paymentId,
        razorpaySignature: signature,
        status: 'paid',
        paymentDate: new Date()
      },
      { new: true }
    );

    // Update EMI status if EMI ID provided
    if (emiId) {
      const emi = await EMI.findById(emiId);
      if (emi && emi.status !== 'Paid') {
        emi.status = 'Paid';
        emi.paidDate = new Date();
        emi.paymentMode = 'Online';
        emi.transactionId = paymentId;
        emi.paidAmount = emi.amount;
        await emi.save();

        // Check if all EMIs for this sale are paid
        const pendingEmis = await EMI.countDocuments({
          saleId: emi.saleId,
          status: { $ne: 'Paid' }
        });

        if (pendingEmis === 0) {
          const Sale = require('../models/Sale');
          await Sale.findByIdAndUpdate(emi.saleId, { status: 'Completed' });
        }

        // Create notification
        await Notification.create({
          userId: customerId,
          title: 'Payment Successful',
          message: `Your EMI payment of ₹${parseFloat(emi.amount).toLocaleString('en-IN')} has been successfully processed.`,
          type: 'payment',
          priority: 'normal',
          read: false
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:orderId
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await Payment.findOne({ orderId })
      .populate('customerId', 'name email phone')
      .populate('emiId');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};