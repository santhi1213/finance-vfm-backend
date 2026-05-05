const Agent = require('../models/Agent');

exports.createAgent = async (req, res) => {
  try {
    console.log('Creating agent with data:', req.body);

    const {
      name,
      age,
      aadharNo,
      contactDetails,
      address,
      employmentDetails,
      bankDetails
    } = req.body;

    // Validate required fields
    if (!name || !age || !aadharNo || !contactDetails || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, age, aadharNo, contactDetails, address'
      });
    }

    // Validate age
    if (age < 18 || age > 100) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 18 and 100 years'
      });
    }

    // Validate contact details
    if (!contactDetails.phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required in contact details'
      });
    }

    // Validate address fields
    if (!address.street || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete address: street, city, state, pincode'
      });
    }

    // Check if agent with same Aadhar exists
    const existingAadhar = await Agent.findOne({ aadharNo });
    if (existingAadhar) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this Aadhar number already exists'
      });
    }

    // Check if employee ID is unique if provided
    if (employmentDetails?.employeeId) {
      const existingEmpId = await Agent.findOne({ 'employmentDetails.employeeId': employmentDetails.employeeId });
      if (existingEmpId) {
        return res.status(400).json({
          success: false,
          message: 'Agent with this Employee ID already exists'
        });
      }
    }

    // Create agent
    const agentData = {
      name,
      age,
      aadharNo,
      contactDetails,
      address,
      employmentDetails: employmentDetails || {},
      bankDetails: bankDetails || {}
    };

    const agent = new Agent(agentData);
    await agent.save();

    console.log('Agent created successfully:', agent._id);

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: agent
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Agent with this ${field} already exists`
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contactDetails.email': { $regex: search, $options: 'i' } },
        { 'contactDetails.phone': { $regex: search, $options: 'i' } },
        { aadharNo: { $regex: search, $options: 'i' } },
        { 'employmentDetails.employeeId': { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query['employmentDetails.department'] = department;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const agents = await Agent.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Agent.countDocuments(query);

    res.status(200).json({
      success: true,
      count: agents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: agents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    console.log('Updating agent:', req.params.id);
    console.log('Update data:', req.body);

    const {
      name,
      age,
      aadharNo,
      contactDetails,
      address,
      employmentDetails,
      bankDetails,
      isActive
    } = req.body;

    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    if (age !== undefined && (age < 18 || age > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Age must be between 18 and 100 years'
      });
    }

    if (aadharNo && aadharNo !== agent.aadharNo) {
      const existingAadhar = await Agent.findOne({ aadharNo, _id: { $ne: req.params.id } });
      if (existingAadhar) {
        return res.status(400).json({
          success: false,
          message: 'Another agent with this Aadhar number already exists'
        });
      }
    }

    if (employmentDetails?.employeeId && 
        employmentDetails.employeeId !== agent.employmentDetails?.employeeId) {
      const existingEmpId = await Agent.findOne({ 
        'employmentDetails.employeeId': employmentDetails.employeeId,
        _id: { $ne: req.params.id }
      });
      if (existingEmpId) {
        return res.status(400).json({
          success: false,
          message: 'Another agent with this Employee ID already exists'
        });
      }
    }

    if (name) agent.name = name;
    if (age !== undefined) agent.age = age;
    if (aadharNo) agent.aadharNo = aadharNo;
    if (contactDetails) {
      agent.contactDetails = {
        ...agent.contactDetails,
        ...contactDetails
      };
    }
    if (address) {
      agent.address = {
        ...agent.address,
        ...address
      };
    }
    if (employmentDetails) {
      agent.employmentDetails = {
        ...agent.employmentDetails,
        ...employmentDetails
      };
    }
    if (bankDetails) {
      agent.bankDetails = {
        ...agent.bankDetails,
        ...bankDetails
      };
    }
    if (isActive !== undefined) agent.isActive = isActive;

    await agent.save();

    console.log('Agent updated successfully:', agent._id);

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      data: agent
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Another agent with this ${field} already exists`
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    agent.isActive = false;
    await agent.save();

    console.log('Agent deactivated successfully:', agent._id);

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.hardDeleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    console.log('Agent permanently deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Agent permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting agent:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleAgentStatus = async (req, res) => {
  try {
    console.log('Toggling agent status for ID:', req.params.id);
    
    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    agent.isActive = !agent.isActive;
    await agent.save();

    console.log(`Agent ${agent._id} status toggled to: ${agent.isActive}`);

    res.status(200).json({
      success: true,
      message: `Agent ${agent.isActive ? 'activated' : 'deactivated'} successfully`,
      data: agent
    });
  } catch (error) {
    console.error('Error toggling agent status:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID format'
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAgentsByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const agents = await Agent.find({ 
      'employmentDetails.department': department,
      isActive: true 
    })
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Agent.countDocuments({ 
      'employmentDetails.department': department,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      count: agents.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: agents
    });
  } catch (error) {
    console.error('Error fetching agents by department:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};