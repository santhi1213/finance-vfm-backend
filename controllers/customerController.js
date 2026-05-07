// const Customer = require('../models/Customer');
// const Agent = require('../models/Agent');
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');

// // @desc    Create a new customer
// // @route   POST /api/customers
// const createCustomer = async (req, res) => {
//   try {
//     console.log('Creating customer with data:', req.body);

//     const {
//       name,
//       aadharNo,
//       panNo,
//       address,
//       phone,
//       alternatePhone,
//       email,
//       assignedAgent,
//       dateOfBirth,
//       occupation,
//       annualIncome
//     } = req.body;

//     // Validate required fields
//     if (!name || !aadharNo || !panNo || !address || !phone) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide all required fields: name, aadharNo, panNo, address, phone'
//       });
//     }

//     // Validate email if provided (for login)
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email is required for customer login access'
//       });
//     }

//     // Validate address fields
//     if (!address.street || !address.city || !address.state || !address.pincode) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide complete address: street, city, state, pincode'
//       });
//     }

//     // Check if customer with same Aadhar exists
//     const existingAadhar = await Customer.findOne({ aadharNo });
//     if (existingAadhar) {
//       return res.status(400).json({
//         success: false,
//         message: 'Customer with this Aadhar number already exists'
//       });
//     }

//     // Check if customer with same PAN exists
//     const existingPAN = await Customer.findOne({ panNo: panNo.toUpperCase() });
//     if (existingPAN) {
//       return res.status(400).json({
//         success: false,
//         message: 'Customer with this PAN number already exists'
//       });
//     }

//     // Check if user with same email already exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     // Verify assigned agent exists and is active ONLY IF provided
//     if (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') {
//       const agent = await Agent.findOne({ 
//         _id: assignedAgent, 
//         isActive: true 
//       });
      
//       if (!agent) {
//         return res.status(400).json({
//           success: false,
//           message: 'Assigned agent not found or is not an active agent'
//         });
//       }
//     }

//     // Generate a default password
//     const defaultPassword = `customer@${aadharNo.slice(-4)}${name.slice(0,2).toLowerCase()}`;
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(defaultPassword, salt);

//     // Create User account for customer
//     const user = new User({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: 'customer',
//       phone,
//       address: {
//         street: address.street,
//         city: address.city,
//         state: address.state,
//         pincode: address.pincode,
//         country: address.country || 'India'
//       },
//       isActive: true,
//       customerDetails: {
//         dateOfBirth: dateOfBirth || undefined,
//         occupation: occupation || undefined,
//         annualIncome: annualIncome || undefined,
//         panCard: panNo.toUpperCase(),
//         aadharCard: aadharNo
//       }
//     });

//     await user.save();
//     console.log(`User account created for customer: ${email}`);

//     // Create customer
//     const customerData = {
//       name,
//       aadharNo,
//       panNo: panNo.toUpperCase(),
//       address,
//       phone,
//       alternatePhone: alternatePhone || undefined,
//       email: email.toLowerCase(),
//       assignedAgent: (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') ? assignedAgent : null,
//       dateOfBirth: dateOfBirth || undefined,
//       occupation: occupation || undefined,
//       annualIncome: annualIncome || undefined,
//       createdBy: req.user ? req.user._id : null,
//       userId: user._id
//     };

//     const customer = new Customer(customerData);
//     await customer.save();

//     // Send email with credentials
//     const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
//     try {
//       await emailService.sendCustomerCredentials(email, name, defaultPassword, loginUrl);
//       console.log(`Credentials email sent to ${email}`);
//     } catch (emailError) {
//       console.error('Failed to send credentials email:', emailError);
//       // Don't fail the creation if email fails
//     }

//     // Populate assigned agent details if exists
//     if (customer.assignedAgent) {
//       await customer.populate({
//         path: 'assignedAgent',
//         model: 'Agent',
//         select: 'name age contactDetails.address employmentDetails isActive'
//       });
//     }

//     console.log('Customer created successfully:', customer._id);

//     res.status(201).json({
//       success: true,
//       message: 'Customer created successfully. Login credentials have been sent to their email.',
//       data: {
//         customer,
//         emailSent: true,
//         email: email.toLowerCase()
//       }
//     });
//   } catch (error) {
//     console.error('Error creating customer:', error);
    
//     if (error.name === 'CastError' && error.path === '_id') {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid agent ID format. Please select a valid agent from the list.'
//       });
//     }
    
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({
//         success: false,
//         message: `Customer with this ${field} already exists`
//       });
//     }
    
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get all customers
// // @route   GET /api/customers
// const getAllCustomers = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       search,
//       assignedAgent,
//       isActive,
//       sortBy = 'createdAt',
//       sortOrder = 'desc'
//     } = req.query;

//     // Build query
//     let query = {};

//     // Search by name, email, aadhar, pan
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { email: { $regex: search, $options: 'i' } },
//         { aadharNo: { $regex: search, $options: 'i' } },
//         { panNo: { $regex: search, $options: 'i' } },
//         { phone: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Filter by assigned agent
//     if (assignedAgent) {
//       query.assignedAgent = assignedAgent;
//     }

//     // Filter by status
//     if (isActive !== undefined) {
//       query.isActive = isActive === 'true';
//     }

//     // Build sort options
//     const sort = {};
//     sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

//     // Execute query with pagination
//     const customers = await Customer.find(query)
//       .populate({
//         path: 'assignedAgent',
//         model: 'Agent',
//         select: 'name age contactDetails.address employmentDetails isActive'
//       })
//       .populate('createdBy', 'name email')
//       .populate('updatedBy', 'name email')
//       .sort(sort)
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     // Get total count
//     const total = await Customer.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       count: customers.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / parseInt(limit)),
//       data: customers
//     });
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get single customer by ID
// // @route   GET /api/customers/:id
// const getCustomerById = async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id)
//       .populate({
//         path: 'assignedAgent',
//         model: 'Agent',
//         select: 'name age contactDetails address employmentDetails isActive'
//       })
//       .populate('createdBy', 'name email')
//       .populate('updatedBy', 'name email');

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: customer
//     });
//   } catch (error) {
//     console.error('Error fetching customer:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Update customer
// // @route   PUT /api/customers/:id
// const updateCustomer = async (req, res) => {
//   try {
//     console.log('Updating customer:', req.params.id);
//     console.log('Update data:', req.body);

//     const {
//       name,
//       aadharNo,
//       panNo,
//       address,
//       phone,
//       alternatePhone,
//       email,
//       assignedAgent,
//       dateOfBirth,
//       occupation,
//       annualIncome,
//       isActive
//     } = req.body;

//     // Find customer
//     const customer = await Customer.findById(req.params.id);
//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found'
//       });
//     }

//     // Check Aadhar uniqueness if being updated
//     if (aadharNo && aadharNo !== customer.aadharNo) {
//       const existingAadhar = await Customer.findOne({ aadharNo, _id: { $ne: req.params.id } });
//       if (existingAadhar) {
//         return res.status(400).json({
//           success: false,
//           message: 'Another customer with this Aadhar number already exists'
//         });
//       }
//     }

//     // Check PAN uniqueness if being updated
//     if (panNo && panNo !== customer.panNo) {
//       const existingPAN = await Customer.findOne({ 
//         panNo: panNo.toUpperCase(), 
//         _id: { $ne: req.params.id } 
//       });
//       if (existingPAN) {
//         return res.status(400).json({
//           success: false,
//           message: 'Another customer with this PAN number already exists'
//         });
//       }
//     }

//     // Verify assigned agent if being updated and not null
//     if (assignedAgent !== undefined && assignedAgent !== 'none' && assignedAgent !== '') {
//       const agent = await Agent.findOne({ 
//         _id: assignedAgent, 
//         isActive: true 
//       });
//       if (!agent) {
//         return res.status(400).json({
//           success: false,
//           message: 'Assigned agent not found or is not an active agent'
//         });
//       }
//     }

//     // Update fields
//     if (name) customer.name = name;
//     if (aadharNo) customer.aadharNo = aadharNo;
//     if (panNo) customer.panNo = panNo.toUpperCase();
//     if (address) {
//       customer.address = {
//         ...customer.address.toObject(),
//         ...address
//       };
//     }
//     if (phone) customer.phone = phone;
//     if (alternatePhone !== undefined) customer.alternatePhone = alternatePhone;
//     if (email !== undefined) customer.email = email ? email.toLowerCase() : undefined;
//     if (assignedAgent !== undefined) {
//       customer.assignedAgent = (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') ? assignedAgent : null;
//     }
//     if (dateOfBirth !== undefined) customer.dateOfBirth = dateOfBirth;
//     if (occupation !== undefined) customer.occupation = occupation;
//     if (annualIncome !== undefined) customer.annualIncome = annualIncome;
//     if (isActive !== undefined) customer.isActive = isActive;
    
//     customer.updatedBy = req.user ? req.user._id : null;

//     await customer.save();

//     // Populate references if assignedAgent exists
//     if (customer.assignedAgent) {
//       await customer.populate({
//         path: 'assignedAgent',
//         model: 'Agent',
//         select: 'name age contactDetails address employmentDetails isActive'
//       });
//     }
//     await customer.populate('updatedBy', 'name email');

//     console.log('Customer updated successfully:', customer._id);

//     res.status(200).json({
//       success: true,
//       message: 'Customer updated successfully',
//       data: customer
//     });
//   } catch (error) {
//     console.error('Error updating customer:', error);
    
//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({
//         success: false,
//         message: `Another customer with this ${field} already exists`
//       });
//     }
    
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Delete customer (soft delete by deactivating)
// // @route   DELETE /api/customers/:id
// const deleteCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found'
//       });
//     }

//     // Soft delete - just deactivate
//     customer.isActive = false;
//     customer.updatedBy = req.user ? req.user._id : null;
//     await customer.save();

//     console.log('Customer deactivated successfully:', customer._id);

//     res.status(200).json({
//       success: true,
//       message: 'Customer deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting customer:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Hard delete customer (permanent)
// // @route   DELETE /api/customers/:id/hard
// const hardDeleteCustomer = async (req, res) => {
//   try {
//     const customer = await Customer.findByIdAndDelete(req.params.id);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found'
//       });
//     }

//     console.log('Customer permanently deleted:', req.params.id);

//     res.status(200).json({
//       success: true,
//       message: 'Customer permanently deleted'
//     });
//   } catch (error) {
//     console.error('Error hard deleting customer:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Toggle customer status
// // @route   PATCH /api/customers/:id/toggle-status
// const toggleCustomerStatus = async (req, res) => {
//   try {
//     const customer = await Customer.findById(req.params.id);

//     if (!customer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Customer not found'
//       });
//     }

//     customer.isActive = !customer.isActive;
//     customer.updatedBy = req.user ? req.user._id : null;
//     await customer.save();

//     if (customer.assignedAgent) {
//       await customer.populate({
//         path: 'assignedAgent',
//         model: 'Agent',
//         select: 'name contactDetails.address employmentDetails isActive'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
//       data: customer
//     });
//   } catch (error) {
//     console.error('Error toggling customer status:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // @desc    Get customers by assigned agent
// // @route   GET /api/customers/agent/:agentId
// const getCustomersByAgent = async (req, res) => {
//   try {
//     const { agentId } = req.params;
//     const { page = 1, limit = 10 } = req.query;

//     // Verify agent exists
//     const agent = await Agent.findOne({ _id: agentId, isActive: true });
//     if (!agent) {
//       return res.status(404).json({
//         success: false,
//         message: 'Agent not found'
//       });
//     }

//     const customers = await Customer.find({ 
//       assignedAgent: agentId,
//       isActive: true 
//     })
//       .populate({
//         path: 'assignedAgent',
//         model: 'Agent',
//         select: 'name contactDetails.address employmentDetails'
//       })
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Customer.countDocuments({ assignedAgent: agentId, isActive: true });

//     res.status(200).json({
//       success: true,
//       count: customers.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / parseInt(limit)),
//       data: customers
//     });
//   } catch (error) {
//     console.error('Error fetching agent customers:', error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Export all functions
// module.exports = {
//   createCustomer,
//   getAllCustomers,
//   getCustomerById,
//   updateCustomer,
//   deleteCustomer,
//   hardDeleteCustomer,
//   getCustomersByAgent,
//   toggleCustomerStatus
// };


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

    // Validate email
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

    // Check if user with same email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify assigned agent exists if provided
    let agentId = null;
    if (assignedAgent && assignedAgent !== 'none' && assignedAgent !== '') {
      const agent = await Agent.findOne({ 
        _id: assignedAgent, 
        isActive: true 
      });
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Assigned agent not found or is not active'
        });
      }
      agentId = assignedAgent;
    }

    // Generate default password
    const defaultPassword = `customer@${aadharNo.slice(-4)}${name.slice(0,2).toLowerCase()}`;
    console.log('Generated password:', defaultPassword);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    console.log('Password hashed successfully');

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
    console.log(`✅ User created with ID: ${user._id} and email: ${user.email}`);

    // STEP 2: Create Customer with userId reference
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
      userId: user._id,  // Link to User
      dateOfBirth: dateOfBirth || undefined,
      occupation: occupation || undefined,
      annualIncome: annualIncome || undefined,
      createdBy: req.user ? req.user._id : null
    });

    await customer.save();
    console.log(`✅ Customer created with ID: ${customer._id}`);

    // STEP 3: Send email with credentials (optional - won't break creation if fails)
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    let emailSent = false;
    
    try {
      await emailService.sendCustomerCredentials(email, name, defaultPassword, loginUrl);
      console.log(`✅ Credentials email sent to ${email}`);
      emailSent = true;
    } catch (emailError) {
      console.error('❌ Failed to send credentials email:', emailError.message);
      // Don't fail the creation if email fails
    }

    // STEP 4: Return success response
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
        },
        email: email.toLowerCase()
      }
    });

  } catch (error) {
    console.error('❌ Error creating customer:', error);
    
    // Handle duplicate key error
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

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus
};

