const mongoose = require('mongoose');
const EMI = require('../models/EMI');
const Sale = require('../models/Sale');

// @desc    Get all EMIs with filters
// @route   GET /api/emis
exports.getAllEmis = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    
    const {
      page = 1,
      limit = 50,
      customerId,
      saleId,
      status,
      startDate,
      endDate,
      overdue
    } = req.query;

    // Build query
    let query = {};

    if (customerId) query.customerId = customerId;
    if (saleId) query.saleId = saleId;
    if (status) query.status = status;

    // Date range filter for due date
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    // Filter overdue EMIs
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'Paid' };
    }

    // Execute query with pagination
    const emis = await EMI.find(query)
      .populate({
        path: 'saleId',
        populate: [
          { path: 'vehicleId', select: 'name model' },
          { path: 'customerId', select: 'name phone' }
        ]
      })
      .populate('customerId', 'name phone email')
      .sort({ dueDate: 1, installmentNo: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await EMI.countDocuments(query);

    res.status(200).json({
      success: true,
      count: emis.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: emis
    });
  } catch (error) {
    console.error('Error fetching EMIs:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get EMI by ID
// @route   GET /api/emis/:id
exports.getEmiById = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id)
      .populate({
        path: 'saleId',
        populate: [
          { path: 'vehicleId', select: 'name model price' },
          { path: 'customerId', select: 'name phone email address' },
          { path: 'agentId', select: 'name phone' }
        ]
      })
      .populate('customerId', 'name phone email address');

    if (!emi) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: emi
    });
  } catch (error) {
    console.error('Error fetching EMI:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get EMIs by sale ID
// @route   GET /api/emis/sale/:saleId
exports.getEmisBySale = async (req, res) => {
  try {
    const { saleId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const emis = await EMI.find({ saleId })
      .populate('customerId', 'name phone')
      .sort({ installmentNo: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await EMI.countDocuments({ saleId });

    // Get sale details
    const sale = await Sale.findById(saleId)
      .populate('vehicleId', 'name model price')
      .populate('customerId', 'name phone');

    res.status(200).json({
      success: true,
      count: emis.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      sale: sale,
      data: emis
    });
  } catch (error) {
    console.error('Error fetching sale EMIs:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get EMIs by customer ID
// @route   GET /api/emis/customer/:customerId
exports.getEmisByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    let query = { customerId };
    if (status) query.status = status;

    const emis = await EMI.find(query)
      .populate({
        path: 'saleId',
        populate: { path: 'vehicleId', select: 'name model' }
      })
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await EMI.countDocuments(query);

    // Group by sale
    const grouped = emis.reduce((acc, emi) => {
      const saleId = emi.saleId._id.toString();
      if (!acc[saleId]) {
        acc[saleId] = {
          sale: emi.saleId,
          emis: []
        };
      }
      acc[saleId].emis.push(emi);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: emis.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: {
        grouped: Object.values(grouped),
        all: emis
      }
    });
  } catch (error) {
    console.error('Error fetching customer EMIs:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update EMI status (mark as paid)
// @route   PATCH /api/emis/:id/pay
exports.payEmi = async (req, res) => {
  try {
    // REMOVE THIS LINE - Don't set CORS headers in controller
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    
    const { paymentMode, transactionId, paidAmount, paidDate } = req.body;
    
    console.log('Paying EMI:', req.params.id);
    console.log('Payment data:', req.body);
    console.log('Origin:', req.headers.origin);

    // Validate EMI ID
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'EMI ID is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid EMI ID format'
      });
    }

    const emi = await EMI.findById(req.params.id);

    if (!emi) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    if (emi.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This EMI has already been paid'
      });
    }

    // Validate payment data
    if (!paymentMode) {
      return res.status(400).json({
        success: false,
        message: 'Payment mode is required'
      });
    }

    // Update EMI record
    emi.status = 'Paid';
    emi.paidDate = paidDate ? new Date(paidDate) : new Date();
    emi.paymentMode = paymentMode;
    emi.paidAmount = paidAmount || emi.amount;
    emi.transactionId = transactionId;

    await emi.save();

    console.log(`EMI ${emi.emiId} marked as paid`);

    // Check if all EMIs for this sale are paid
    const pendingEmis = await EMI.countDocuments({
      saleId: emi.saleId,
      status: { $ne: 'Paid' }
    });

    if (pendingEmis === 0) {
      // Update sale status to Completed
      await Sale.findByIdAndUpdate(emi.saleId, { status: 'Completed' });
      console.log(`Sale ${emi.saleId} completed - all EMIs paid`);
    }

    res.status(200).json({
      success: true,
      message: 'EMI marked as paid successfully',
      data: emi
    });
  } catch (error) {
    console.error('Error paying EMI:', error);
    
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid EMI ID format'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get EMI statistics
// @route   GET /api/emis/stats
exports.getEmiStats = async (req, res) => {
  try {
    // Set CORS headers explicitly for this endpoint
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    console.log('Getting EMI stats - Origin:', req.headers.origin);
    
    const currentDate = new Date();

    // Overall statistics
    const overallStats = await EMI.aggregate([
      {
        $group: {
          _id: null,
          totalEmis: { $sum: 1 },
          totalAmount: { $sum: { $toDouble: '$amount' } },
          paidAmount: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Paid'] },
                { $toDouble: '$amount' },
                0
              ]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [
                { $ne: ['$status', 'Paid'] },
                { $toDouble: '$amount' },
                0
              ]
            }
          }
        }
      }
    ]);

    // Status breakdown
    const statusBreakdown = await EMI.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: { $toDouble: '$amount' } }
        }
      }
    ]);

    // Overdue EMIs
    const overdueEmis = await EMI.find({
      dueDate: { $lt: currentDate },
      status: { $ne: 'Paid' }
    }).countDocuments();

    // Upcoming EMIs (next 30 days)
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const upcomingEmis = await EMI.find({
      dueDate: {
        $gte: currentDate,
        $lte: nextMonth
      },
      status: 'Pending'
    }).countDocuments();

    res.status(200).json({
      success: true,
      data: {
        overall: overallStats[0] || { totalEmis: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 },
        statusBreakdown,
        overdue: overdueEmis,
        upcoming: upcomingEmis
      }
    });
  } catch (error) {
    console.error('Error fetching EMI stats:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send reminder for EMI
// @route   POST /api/emis/:id/remind
exports.sendEmiReminder = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    
    const emi = await EMI.findById(req.params.id)
      .populate('customerId', 'name phone email')
      .populate({
        path: 'saleId',
        populate: { path: 'vehicleId', select: 'name model' }
      });

    if (!emi) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    // Update reminder status
    emi.reminderSent = true;
    emi.reminderDate = new Date();
    await emi.save();

    // Here you would integrate with your email/SMS service
    console.log(`Reminder sent for EMI ${emi.emiId}`);
    console.log(`Customer: ${emi.customerId?.name}`);
    console.log(`Amount: ₹${emi.amount}`);
    console.log(`Due Date: ${emi.dueDate.toISOString().split('T')[0]}`);

    res.status(200).json({
      success: true,
      message: 'Reminder sent successfully',
      data: emi
    });
  } catch (error) {
    console.error('Error sending EMI reminder:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get overdue EMIs
// @route   GET /api/emis/overdue
exports.getOverdueEmis = async (req, res) => {
  try {
    const currentDate = new Date();

    // Find EMIs that are overdue (due date passed and status not paid)
    const overdueEmis = await EMI.find({
      dueDate: { $lt: currentDate },
      status: { $ne: 'Paid' }
    })
      .populate('saleId', 'saleId vehicleId')
      .populate('customerId', 'name phone email')
      .sort({ dueDate: 1 });

    // Calculate late fee for each (optional)
    const overdueWithFee = overdueEmis.map(emi => {
      const daysOverdue = Math.floor((currentDate - emi.dueDate) / (1000 * 60 * 60 * 24));
      const lateFee = Math.max(0, daysOverdue * 10); // ₹10 per day late fee
      
      return {
        ...emi.toObject(),
        daysOverdue,
        calculatedLateFee: lateFee
      };
    });

    res.status(200).json({
      success: true,
      count: overdueWithFee.length,
      data: overdueWithFee
    });
  } catch (error) {
    console.error('Error fetching overdue EMIs:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};