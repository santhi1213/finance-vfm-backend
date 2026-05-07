const Agent = require('../models/Agent');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const EMI = require('../models/EMI');
const Notification = require('../models/Notification');

// @desc    Get agent dashboard data
// @route   GET /api/agent/dashboard
exports.getDashboard = async (req, res) => {
  try {
    // Find agent profile linked to this user
    const agent = await Agent.findOne({ 'contactDetails.email': req.user.email });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    // Get customers assigned to this agent
    const assignedCustomers = await Customer.find({ assignedAgent: agent._id, isActive: true });
    const customerIds = assignedCustomers.map(c => c._id);

    // Get all EMIs for assigned customers
    const emis = await EMI.find({ customerId: { $in: customerIds } })
      .populate('customerId', 'name phone email')
      .populate({
        path: 'saleId',
        populate: { path: 'vehicleId', select: 'name model' }
      })
      .sort({ dueDate: 1 });

    const pendingEmis = emis.filter(e => e.status !== 'Paid');
    const paidEmis = emis.filter(e => e.status === 'Paid');
    const overdueEmis = emis.filter(e => e.status === 'Overdue' || (e.status !== 'Paid' && new Date(e.dueDate) < new Date()));
    
    const totalToCollect = pendingEmis.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalCollected = paidEmis.reduce((sum, e) => sum + parseFloat(e.paidAmount || e.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        agent: {
          id: agent._id,
          name: agent.name,
          email: agent.contactDetails?.email,
          phone: agent.contactDetails?.phone
        },
        summary: {
          assignedCustomers: assignedCustomers.length,
          pendingCollections: pendingEmis.length,
          completedCollections: paidEmis.length,
          overdueCollections: overdueEmis.length,
          totalToCollect: totalToCollect,
          totalCollected: totalCollected
        },
        assignedCustomers: assignedCustomers,
        emis: emis,
        pendingEmis: pendingEmis
      }
    });
  } catch (error) {
    console.error('Error fetching agent dashboard:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get agent's assigned customers
// @route   GET /api/agent/customers
exports.getAssignedCustomers = async (req, res) => {
  try {
    const agent = await Agent.findOne({ 'contactDetails.email': req.user.email });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    const customers = await Customer.find({ assignedAgent: agent._id, isActive: true })
      .select('name phone email address occupation annualIncome')
      .sort({ name: 1 });

    // Get collection stats for each customer
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const emis = await EMI.find({ customerId: customer._id });
      const pendingEmis = emis.filter(e => e.status !== 'Paid');
      const totalPending = pendingEmis.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      return {
        ...customer.toObject(),
        stats: {
          totalEmis: emis.length,
          pendingEmis: pendingEmis.length,
          paidEmis: emis.filter(e => e.status === 'Paid').length,
          totalPendingAmount: totalPending
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: customersWithStats
    });
  } catch (error) {
    console.error('Error fetching assigned customers:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get collections for agent
// @route   GET /api/agent/collections
exports.getCollections = async (req, res) => {
  try {
    const { status, customerId } = req.query;
    
    const agent = await Agent.findOne({ 'contactDetails.email': req.user.email });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    // Build query for customers
    const customerQuery = { assignedAgent: agent._id, isActive: true };
    if (customerId) {
      customerQuery._id = customerId;
    }

    const assignedCustomers = await Customer.find(customerQuery);
    const customerIds = assignedCustomers.map(c => c._id);

    // Build EMI query
    const emiQuery = { customerId: { $in: customerIds } };
    if (status) {
      emiQuery.status = status;
    }

    const emis = await EMI.find(emiQuery)
      .populate('customerId', 'name phone email address')
      .populate({
        path: 'saleId',
        populate: { path: 'vehicleId', select: 'name model' }
      })
      .sort({ dueDate: 1 });

    // Group by customer
    const groupedByCustomer = {};
    emis.forEach(emi => {
      const customerIdStr = emi.customerId._id.toString();
      if (!groupedByCustomer[customerIdStr]) {
        groupedByCustomer[customerIdStr] = {
          customer: emi.customerId,
          emis: []
        };
      }
      groupedByCustomer[customerIdStr].emis.push(emi);
    });

    res.status(200).json({
      success: true,
      data: {
        total: emis.length,
        pending: emis.filter(e => e.status !== 'Paid').length,
        paid: emis.filter(e => e.status === 'Paid').length,
        groupedByCustomer: Object.values(groupedByCustomer),
        allEmis: emis
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark EMI as collected (agent)
// @route   POST /api/agent/collect-emi/:emiId
exports.collectEmi = async (req, res) => {
  try {
    const { emiId } = req.params;
    const { paymentMode, transactionId, collectedAmount } = req.body;

    const agent = await Agent.findOne({ 'contactDetails.email': req.user.email });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    const emi = await EMI.findById(emiId)
      .populate('customerId', 'name phone email');

    if (!emi) {
      return res.status(404).json({
        success: false,
        message: 'EMI record not found'
      });
    }

    // Verify that this EMI belongs to a customer assigned to this agent
    const customer = await Customer.findOne({ 
      _id: emi.customerId._id, 
      assignedAgent: agent._id 
    });

    if (!customer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to collect this EMI'
      });
    }

    if (emi.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This EMI has already been collected'
      });
    }

    // Update EMI record
    emi.status = 'Paid';
    emi.paidDate = new Date();
    emi.paymentMode = paymentMode || 'Cash';
    emi.transactionId = transactionId || `COL${Date.now()}`;
    emi.paidAmount = collectedAmount || emi.amount;

    await emi.save();

    // Create notification for customer
    await Notification.create({
      userId: customer._id,
      title: 'EMI Collection',
      message: `EMI payment of ₹${parseFloat(emi.amount).toLocaleString('en-IN')} (Installment ${emi.installmentNo}) has been collected by agent ${agent.name}.`,
      type: 'collection',
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
      message: 'EMI collected successfully',
      data: emi
    });
  } catch (error) {
    console.error('Error collecting EMI:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get agent profile
// @route   GET /api/agent/profile
exports.getProfile = async (req, res) => {
  try {
    const agent = await Agent.findOne({ 'contactDetails.email': req.user.email })
      .select('-__v');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update agent profile
// @route   PUT /api/agent/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['contactDetails', 'address', 'bankDetails'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = {
          ...(updateData[field] || {}),
          ...req.body[field]
        };
      }
    });

    const agent = await Agent.findOneAndUpdate(
      { 'contactDetails.email': req.user.email },
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: agent
    });
  } catch (error) {
    console.error('Error updating agent profile:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};