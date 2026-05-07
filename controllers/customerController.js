const Customer = require('../models/Customer');
const Agent = require('../models/Agent');

// @desc    Create a new customer
// @route   POST /api/customers
const createCustomer = async (req, res) => {
  try {
    console.log('Creating customer with data:', req.body);

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

    // Validate address fields
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete address: street, city, state, pincode'
      });
    }

    // Check if customer with same Aadhar exists
    const existingAadhar = await Customer.findOne({ aadharNo });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this Aadhar number already exists'
      });
    }

    // Check if customer with same PAN exists
    const existingPAN = await Customer.findOne({ panNo: panNo.toUpperCase() });
    if (existingPAN) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this PAN number already exists'
      });
    }

    // Verify assigned agent exists and is active ONLY IF provided
    if (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') {
      const agent = await Agent.findOne({ 
        _id: assignedAgent, 
        isActive: true 
      });
      
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Assigned agent not found or is not an active agent'
        });
      }
    }

    // Create customer
    const customerData = {
      name,
      aadharNo,
      panNo: panNo.toUpperCase(),
      address,
      phone,
      alternatePhone: alternatePhone || undefined,
      email: email ? email.toLowerCase() : undefined,
      assignedAgent: (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') ? assignedAgent : null,
      dateOfBirth: dateOfBirth || undefined,
      occupation: occupation || undefined,
      annualIncome: annualIncome || undefined,
      createdBy: req.user ? req.user._id : null
    };

    const customer = new Customer(customerData);
    await customer.save();

    // Populate assigned agent details if exists
    if (customer.assignedAgent) {
      await customer.populate({
        path: 'assignedAgent',
        model: 'Agent',
        select: 'name age contactDetails.address employmentDetails isActive'
      });
    }

    console.log('Customer created successfully:', customer._id);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error.name === 'CastError' && error.path === '_id') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format. Please select a valid agent from the list.'
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Customer with this ${field} already exists`
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all customers
// @route   GET /api/customers
const getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      assignedAgent,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    // Search by name, email, aadhar, pan
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { aadharNo: { $regex: search, $options: 'i' } },
        { panNo: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by assigned agent
    if (assignedAgent) {
      query.assignedAgent = assignedAgent;
    }

    // Filter by status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Build sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const customers = await Customer.find(query)
      .populate({
        path: 'assignedAgent',
        model: 'Agent',
        select: 'name age contactDetails.address employmentDetails isActive'
      })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
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

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: 'assignedAgent',
        model: 'Agent',
        select: 'name age contactDetails address employmentDetails isActive'
      })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

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
    console.log('Updating customer:', req.params.id);
    console.log('Update data:', req.body);

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
      annualIncome,
      isActive
    } = req.body;

    // Find customer
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check Aadhar uniqueness if being updated
    if (aadharNo && aadharNo !== customer.aadharNo) {
      const existingAadhar = await Customer.findOne({ aadharNo, _id: { $ne: req.params.id } });
      if (existingAadhar) {
        return res.status(400).json({
          success: false,
          message: 'Another customer with this Aadhar number already exists'
        });
      }
    }

    // Check PAN uniqueness if being updated
    if (panNo && panNo !== customer.panNo) {
      const existingPAN = await Customer.findOne({ 
        panNo: panNo.toUpperCase(), 
        _id: { $ne: req.params.id } 
      });
      if (existingPAN) {
        return res.status(400).json({
          success: false,
          message: 'Another customer with this PAN number already exists'
        });
      }
    }

    // Verify assigned agent if being updated and not null
    if (assignedAgent !== undefined && assignedAgent !== 'none' && assignedAgent !== '') {
      const agent = await Agent.findOne({ 
        _id: assignedAgent, 
        isActive: true 
      });
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Assigned agent not found or is not an active agent'
        });
      }
    }

    // Update fields
    if (name) customer.name = name;
    if (aadharNo) customer.aadharNo = aadharNo;
    if (panNo) customer.panNo = panNo.toUpperCase();
    if (address) {
      customer.address = {
        ...customer.address.toObject(),
        ...address
      };
    }
    if (phone) customer.phone = phone;
    if (alternatePhone !== undefined) customer.alternatePhone = alternatePhone;
    if (email !== undefined) customer.email = email ? email.toLowerCase() : undefined;
    if (assignedAgent !== undefined) {
      customer.assignedAgent = (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') ? assignedAgent : null;
    }
    if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth;
    if (occupation !== undefined) customer.occupation = occupation;
    if (annualIncome !== undefined) customer.annualIncome = annualIncome;
    if (isActive !== undefined) customer.isActive = isActive;
    
    customer.updatedBy = req.user ? req.user._id : null;

    await customer.save();

    // Populate references if assignedAgent exists
    if (customer.assignedAgent) {
      await customer.populate({
        path: 'assignedAgent',
        model: 'Agent',
        select: 'name age contactDetails address employmentDetails isActive'
      });
    }
    await customer.populate('updatedBy', 'name email');

    console.log('Customer updated successfully:', customer._id);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Another customer with this ${field} already exists`
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete customer (soft delete by deactivating)
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

    // Soft delete - just deactivate
    customer.isActive = false;
    customer.updatedBy = req.user ? req.user._id : null;
    await customer.save();

    console.log('Customer deactivated successfully:', customer._id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Hard delete customer (permanent)
// @route   DELETE /api/customers/:id/hard
const hardDeleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    console.log('Customer permanently deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting customer:', error);
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
    customer.updatedBy = req.user ? req.user._id : null;
    await customer.save();

    if (customer.assignedAgent) {
      await customer.populate({
        path: 'assignedAgent',
        model: 'Agent',
        select: 'name contactDetails.address employmentDetails isActive'
      });
    }

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

// @desc    Get customers by assigned agent
// @route   GET /api/customers/agent/:agentId
const getCustomersByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify agent exists
    const agent = await Agent.findOne({ _id: agentId, isActive: true });
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const customers = await Customer.find({ 
      assignedAgent: agentId,
      isActive: true 
    })
      .populate({
        path: 'assignedAgent',
        model: 'Agent',
        select: 'name contactDetails.address employmentDetails'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Customer.countDocuments({ assignedAgent: agentId, isActive: true });

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: customers
    });
  } catch (error) {
    console.error('Error fetching agent customers:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Export all functions
module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  hardDeleteCustomer,
  getCustomersByAgent,
  toggleCustomerStatus
};