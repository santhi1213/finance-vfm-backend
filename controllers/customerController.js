const Customer = require('../models/Customer');
const User = require('../models/User');
const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

// @desc    Create a new customer
// @route   POST /api/customers
const createCustomer = async (req, res) => {
  try {
    console.log('=== CREATING CUSTOMER ===');
    console.log('Request body:', req.body);

    const {
      name,
      aadharNo,
      panNo,
      address,
      phone,
      alternatePhone,
      email,
      assignedAgent,
      dateOfBirth,
      occupation,
      annualIncome
    } = req.body;

    // Validate required fields
    if (!name || !aadharNo || !panNo || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, aadharNo, panNo, address, phone'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required for customer login access'
      });
    }

    // Validate address fields
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete address: street, city, state, pincode'
      });
    }

    // Check for existing records
    const existingAadhar = await Customer.findOne({ aadharNo });
    if (existingAadhar) {
      return res.status(400).json({ success: false, message: 'Customer with this Aadhar number already exists' });
    }

    const existingPAN = await Customer.findOne({ panNo: panNo.toUpperCase() });
    if (existingPAN) {
      return res.status(400).json({ success: false, message: 'Customer with this PAN number already exists' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Verify assigned agent exists if provided
    let agentId = null;
    if (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') {
      const agent = await Agent.findOne({ _id: assignedAgent, isActive: true });
      if (!agent) {
        return res.status(400).json({ success: false, message: 'Assigned agent not found or is not active' });
      }
      agentId = assignedAgent;
    }

    // Generate default password
    const defaultPassword = `customer@${aadharNo.slice(-4)}${name.slice(0,2).toLowerCase()}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // STEP 1: Create User account
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'customer',
      phone,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India'
      },
      isActive: true,
      customerDetails: {
        dateOfBirth: dateOfBirth || undefined,
        occupation: occupation || undefined,
        annualIncome: annualIncome || undefined,
        panCard: panNo.toUpperCase(),
        aadharCard: aadharNo
      }
    });

    await user.save();
    console.log(`✅ User created with ID: ${user._id}`);

    // STEP 2: Create Customer with userId reference - CORRECTED
    const customer = new Customer({
      name,
      aadharNo,
      panNo: panNo.toUpperCase(),
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || 'India'
      },
      phone,
      alternatePhone: alternatePhone || undefined,
      email: email.toLowerCase(),
      assignedAgent: agentId,
      userId: user._id,  // IMPORTANT: Set userId at root level, NOT inside address
      dateOfBirth: dateOfBirth || undefined,
      occupation: occupation || undefined,
      annualIncome: annualIncome || undefined,
      createdBy: req.user ? req.user._id : null
    });

    await customer.save();
    console.log(`✅ Customer created with ID: ${customer._id}`);

    // STEP 3: Send email
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    let emailSent = false;
    
    try {
      await emailService.sendCustomerCredentials(email, name, defaultPassword, loginUrl);
      console.log(`✅ Credentials email sent to ${email}`);
      emailSent = true;
    } catch (emailError) {
      console.error('❌ Failed to send credentials email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Customer created successfully. Login credentials have been sent to their email.',
      emailSent: emailSent,
      data: {
        customer: {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          userId: user._id
        }
      }
    });

  } catch (error) {
    console.error('❌ Error creating customer:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ success: false, message: `Customer with this ${field} already exists` });
    }
    
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate('userId', 'name email role isActive')
      .populate('assignedAgent', 'name contactDetails')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('userId', 'name email role isActive')
      .populate('assignedAgent', 'name contactDetails employmentDetails');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const { name, phone, alternatePhone, address, assignedAgent, isActive } = req.body;
    
    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (alternatePhone !== undefined) customer.alternatePhone = alternatePhone;
    if (address) {
      customer.address = { ...customer.address.toObject(), ...address };
    }
    if (assignedAgent !== undefined) {
      customer.assignedAgent = assignedAgent === 'none' ? null : assignedAgent;
    }
    if (isActive !== undefined) customer.isActive = isActive;
    
    customer.updatedBy = req.user ? req.user._id : null;
    await customer.save();
    
    // Also update User if needed
    if (name || phone || address) {
      await User.findByIdAndUpdate(customer.userId, {
        name: name || customer.name,
        phone: phone || customer.phone,
        address: address ? {
          street: address.street || customer.address.street,
          city: address.city || customer.address.city,
          state: address.state || customer.address.state,
          pincode: address.pincode || customer.address.pincode,
          country: address.country || customer.address.country
        } : undefined
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete customer (soft delete)
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    customer.isActive = false;
    await customer.save();
    
    // Also deactivate User
    await User.findByIdAndUpdate(customer.userId, { isActive: false });
    
    res.status(200).json({
      success: true,
      message: 'Customer deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle customer status
// @route   PATCH /api/customers/:id/toggle-status
const toggleCustomerStatus = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    customer.isActive = !customer.isActive;
    await customer.save();
    
    // Also toggle User status
    await User.findByIdAndUpdate(customer.userId, { isActive: customer.isActive });
    
    res.status(200).json({
      success: true,
      message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: customer
    });
  } catch (error) {
    console.error('Error toggling customer status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Add this method to customerController.js to update agent assignment
const updateCustomerAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedAgent } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Update agent assignment
    customer.assignedAgent = assignedAgent === 'none' || assignedAgent === '' ? null : assignedAgent;
    await customer.save();

    // Also update User's customerDetails if needed
    if (customer.userId) {
      await User.findByIdAndUpdate(customer.userId, {
        'customerDetails.assignedAgent': customer.assignedAgent
      });
    }

    res.status(200).json({
      success: true,
      message: 'Agent assigned successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer agent:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus,
  updateCustomerAgent
};

