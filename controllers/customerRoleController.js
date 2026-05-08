const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const EMI = require('../models/EMI');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find customer profile linked to this user
    const customer = await Customer.findOne({ email: req.user.email });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Get customer's sales
    const sales = await Sale.find({ customerId: customer._id })
      .populate('vehicleId', 'name model price')
      .sort({ saleDate: -1 });

    // Get customer's EMIs
    const emis = await EMI.find({ customerId: customer._id })
      .sort({ dueDate: 1 });

    const pendingEmis = emis.filter(e => e.status !== 'Paid');
    const paidEmis = emis.filter(e => e.status === 'Paid');
    const totalOutstanding = pendingEmis.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        },
        summary: {
          activeLoans: sales.filter(s => s.status === 'Active').length,
          pendingEmis: pendingEmis.length,
          paidEmis: paidEmis.length,
          totalOutstanding: totalOutstanding
        },
        sales: sales,
        emis: emis
      }
    });
  } catch (error) {
    console.error('Error fetching customer dashboard:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLoans = async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.user.email });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    // Get sales with their EMIs
    const sales = await Sale.find({ customerId: customer._id })
      .populate('vehicleId', 'name model price images')
      .sort({ saleDate: -1 });

    const salesWithEmis = await Promise.all(sales.map(async (sale) => {
      const emis = await EMI.find({ saleId: sale._id })
        .sort({ installmentNo: 1 });
      
      return {
        ...sale.toObject(),
        emis: emis,
        paidCount: emis.filter(e => e.status === 'Paid').length,
        totalCount: emis.length
      };
    }));

    res.status(200).json({
      success: true,
      data: salesWithEmis
    });
  } catch (error) {
    console.error('Error fetching customer loans:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.payEmi = async (req, res) => {
  try {
    const { emiId } = req.params;
    const { paymentMode, transactionId } = req.body;

    const customer = await Customer.findOne({ email: req.user.email });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    const emi = await EMI.findOne({ _id: emiId, customerId: customer._id });
    
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

    // Update EMI record
    emi.status = 'Paid';
    emi.paidDate = new Date();
    emi.paymentMode = paymentMode || 'Online';
    emi.transactionId = transactionId || `TXN${Date.now()}`;
    emi.paidAmount = emi.amount;

    await emi.save();

    // Create notification for customer
    await Notification.create({
      userId: req.user._id,
      title: 'EMI Payment Successful',
      message: `Payment of ₹${parseFloat(emi.amount).toLocaleString('en-IN')} for EMI #${emi.installmentNo} has been successfully processed.`,
      type: 'payment',
      priority: 'normal',
      read: false
    });

    // Check if all EMIs for this sale are paid
    const pendingEmis = await EMI.countDocuments({
      saleId: emi.saleId,
      status: { $ne: 'Paid' }
    });

    if (pendingEmis === 0) {
      await Sale.findByIdAndUpdate(emi.saleId, { status: 'Completed' });
    }

    res.status(200).json({
      success: true,
      message: 'EMI paid successfully',
      data: emi
    });
  } catch (error) {
    console.error('Error paying EMI:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.user.email })
      .select('-__v');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['phone', 'alternatePhone', 'email', 'address', 'occupation', 'annualIncome'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const customer = await Customer.findOneAndUpdate(
      { email: req.user.email },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};