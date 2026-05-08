// // controllers/paymentController.js - COMPLETE WORKING VERSION
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const Payment = require('../models/Payment');
// const EMI = require('../models/EMI');
// const Customer = require('../models/Customer');
// const Notification = require('../models/Notification');

// // Log environment variables status (for debugging)
// console.log('=== Payment Controller Initialization ===');
// console.log('RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
// console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

// // Initialize Razorpay with error handling
// let razorpayInstance = null;
// try {
//   if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
//     razorpayInstance = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET
//     });
//     console.log('✅ Razorpay initialized successfully with key:', process.env.RAZORPAY_KEY_ID);
//   } else {
//     console.warn('⚠️ Razorpay credentials missing. Please check your .env file');
//   }
// } catch (error) {
//   console.error('❌ Failed to initialize Razorpay:', error.message);
// }

// // Helper function to check if Razorpay is configured
// const isRazorpayConfigured = () => {
//   return razorpayInstance !== null && 
//          process.env.RAZORPAY_KEY_ID && 
//          process.env.RAZORPAY_KEY_ID !== 'rzp_test_YOUR_KEY_ID_HERE' &&
//          process.env.RAZORPAY_KEY_SECRET &&
//          process.env.RAZORPAY_KEY_SECRET !== 'YOUR_KEY_SECRET_HERE';
// };

// // @desc    Create Razorpay order
// // @route   POST /api/payments/create-order
// exports.createOrder = async (req, res) => {
//   try {
//     console.log('=== Creating Razorpay Order ===');
//     console.log('Request body:', req.body);
    
//     // Check if Razorpay is configured
//     if (!isRazorpayConfigured()) {
//       console.error('Razorpay not configured properly');
//       return res.status(503).json({
//         success: false,
//         message: 'Payment service is not configured. Please contact administrator.',
//         error: 'RAZORPAY_NOT_CONFIGURED'
//       });
//     }

//     const { emiId, customerId, amount } = req.body;

//     // Validate required fields
//     if (!emiId || !customerId || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: emiId, customerId, amount'
//       });
//     }

//     // Validate amount is positive
//     if (amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid amount'
//       });
//     }

//     // Validate customer
//     const customer = await Customer.findById(customerId);
//     if (!customer) {
//       return res.status(404).json({ success: false, message: 'Customer not found' });
//     }

//     // Validate EMI
//     const emi = await EMI.findById(emiId);
//     if (!emi) {
//       return res.status(404).json({ success: false, message: 'EMI record not found' });
//     }
    
//     if (emi.status === 'Paid') {
//       return res.status(400).json({ success: false, message: 'This EMI has already been paid' });
//     }

//     // Create Razorpay order
//     const options = {
//       amount: Math.round(amount * 100), // Convert to paise
//       currency: 'INR',
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         customerId: customerId.toString(),
//         emiId: emiId,
//         customerEmail: customer.email || '',
//         customerPhone: customer.phone || ''
//       }
//     };

//     console.log('Creating order with options:', options);

//     const order = await razorpayInstance.orders.create(options);
//     console.log('Order created successfully:', order.id);

//     // Save payment record
//     const payment = new Payment({
//       paymentId: `pay_${Date.now()}`,
//       orderId: order.id,
//       customerId,
//       emiId: emiId,
//       amount: amount,
//       status: 'created'
//     });

//     await payment.save();
//     console.log('Payment record saved:', payment._id);

//     res.status(200).json({
//       success: true,
//       data: {
//         orderId: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         keyId: process.env.RAZORPAY_KEY_ID
//       }
//     });
//   } catch (error) {
//     console.error('Error creating Razorpay order:', error);
    
//     // Handle Razorpay specific errors
//     if (error.error && error.error.description) {
//       return res.status(400).json({
//         success: false,
//         message: error.error.description
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Failed to create payment order'
//     });
//   }
// };

// // @desc    Verify Razorpay payment
// // @route   POST /api/payments/verify
// exports.verifyPayment = async (req, res) => {
//   try {
//     console.log('=== Verifying Payment ===');
//     console.log('Request body:', req.body);

//     const { orderId, paymentId, signature, emiId, customerId } = req.body;

//     // Validate required fields
//     if (!orderId || !paymentId || !signature) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields: orderId, paymentId, signature'
//       });
//     }

//     // Verify signature
//     const body = orderId + '|' + paymentId;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');

//     const isAuthentic = expectedSignature === signature;

//     if (!isAuthentic) {
//       console.error('Invalid signature received');
//       // Update payment status to failed
//       await Payment.findOneAndUpdate(
//         { orderId },
//         { status: 'failed', failureReason: 'Invalid signature' }
//       );
      
//       return res.status(400).json({
//         success: false,
//         message: 'Payment verification failed: Invalid signature'
//       });
//     }

//     console.log('Signature verified successfully');

//     // Update payment record
//     const payment = await Payment.findOneAndUpdate(
//       { orderId },
//       {
//         paymentId,
//         razorpaySignature: signature,
//         status: 'paid',
//         paymentDate: new Date()
//       },
//       { new: true }
//     );

//     if (!payment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Payment record not found'
//       });
//     }

//     console.log('Payment record updated:', payment._id);

//     // Update EMI status
//     if (emiId) {
//       const emi = await EMI.findById(emiId);
//       if (emi && emi.status !== 'Paid') {
//         emi.status = 'Paid';
//         emi.paidDate = new Date();
//         emi.paymentMode = 'Online';
//         emi.transactionId = paymentId;
//         emi.paidAmount = emi.amount;
//         await emi.save();
//         console.log(`✅ EMI ${emiId} marked as paid`);

//         // Check if all EMIs for this sale are paid
//         const pendingEmis = await EMI.countDocuments({
//           saleId: emi.saleId,
//           status: { $ne: 'Paid' }
//         });

//         if (pendingEmis === 0) {
//           const Sale = require('../models/Sale');
//           await Sale.findByIdAndUpdate(emi.saleId, { status: 'Completed' });
//           console.log(`✅ Sale ${emi.saleId} completed - all EMIs paid`);
//         }

//         // Create notification for customer
//         try {
//           await Notification.create({
//             userId: customerId,
//             title: 'Payment Successful',
//             message: `Your EMI payment of ₹${parseFloat(emi.amount).toLocaleString('en-IN')} has been successfully processed.`,
//             type: 'payment',
//             priority: 'normal',
//             read: false
//           });
//           console.log('Notification created for customer');
//         } catch (notifError) {
//           console.error('Failed to create notification:', notifError);
//         }
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Payment verified successfully',
//       data: payment
//     });
//   } catch (error) {
//     console.error('Error verifying payment:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Payment verification failed'
//     });
//   }
// };

// // @desc    Get payment status
// // @route   GET /api/payments/status/:orderId
// exports.getPaymentStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
    
//     const payment = await Payment.findOne({ orderId })
//       .populate('customerId', 'name email phone')
//       .populate('emiId');

//     if (!payment) {
//       return res.status(404).json({ success: false, message: 'Payment not found' });
//     }

//     res.status(200).json({
//       success: true,
//       data: payment
//     });
//   } catch (error) {
//     console.error('Error fetching payment status:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Check if Razorpay is configured
// // @route   GET /api/payments/config-status
// exports.getConfigStatus = async (req, res) => {
//   try {
//     const configured = isRazorpayConfigured();
//     res.status(200).json({
//       success: true,
//       data: {
//         configured,
//         keyId: configured ? process.env.RAZORPAY_KEY_ID : null
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


// controllers/paymentController.js - SIMPLIFIED VERSION
const crypto = require('crypto');

// Import models
const Payment = require('../models/Payment');
const EMI = require('../models/EMI');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');

// Initialize Razorpay directly with environment variables
let Razorpay = null;
let razorpayInstance = null;

try {
  // Only try to load Razorpay if we have the keys
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('✅ Razorpay initialized successfully');
  } else {
    console.warn('⚠️ Razorpay credentials missing in environment variables');
  }
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
}

// Helper function
const isRazorpayConfigured = () => {
  return razorpayInstance !== null && 
         process.env.RAZORPAY_KEY_ID && 
         process.env.RAZORPAY_KEY_SECRET;
};

// @desc    Create Razorpay order
exports.createOrder = async (req, res) => {
  console.log('createOrder called - Razorpay configured:', isRazorpayConfigured());
  
  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Payment service is not configured. Please contact administrator.',
      error: 'RAZORPAY_NOT_CONFIGURED'
    });
  }

  try {
    const { emiId, customerId, amount } = req.body;

    if (!emiId || !customerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: emiId, customerId, amount'
      });
    }

    // Validate customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Validate EMI
    const emi = await EMI.findById(emiId);
    if (!emi) {
      return res.status(404).json({ success: false, message: 'EMI record not found' });
    }
    
    if (emi.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This EMI has already been paid' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerId: customerId.toString(),
        emiId: emiId,
        customerEmail: customer.email || '',
        customerPhone: customer.phone || ''
      }
    };

    console.log('Creating Razorpay order:', options);
    const order = await razorpayInstance.orders.create(options);
    console.log('Order created:', order.id);

    // Save payment record
    const payment = new Payment({
      paymentId: `pay_${Date.now()}`,
      orderId: order.id,
      customerId,
      emiId: emiId,
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
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
};

// @desc    Verify payment
exports.verifyPayment = async (req, res) => {
  if (!isRazorpayConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Payment service is not configured.'
    });
  }

  try {
    const { orderId, paymentId, signature, emiId, customerId } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      await Payment.findOneAndUpdate({ orderId }, { status: 'failed', failureReason: 'Invalid signature' });
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { paymentId, razorpaySignature: signature, status: 'paid', paymentDate: new Date() },
      { new: true }
    );

    // Update EMI if exists
    if (emiId && payment) {
      const emi = await EMI.findById(emiId);
      if (emi && emi.status !== 'Paid') {
        emi.status = 'Paid';
        emi.paidDate = new Date();
        emi.paymentMode = 'Online';
        emi.transactionId = paymentId;
        emi.paidAmount = emi.amount;
        await emi.save();

        // Check if all EMIs paid
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
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ orderId })
      .populate('customerId', 'name email phone')
      .populate('emiId');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check configuration status
exports.getConfigStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      configured: isRazorpayConfigured(),
      keyId: process.env.RAZORPAY_KEY_ID || null,
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
    }
  });
};