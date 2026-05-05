const Vehicle = require('../models/Vehicle');

// Helper function to convert buffer to base64
const bufferToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// @desc    Create a new vehicle with images
// @route   POST /api/vehicles
exports.createVehicle = async (req, res) => {
  try {
    console.log('Creating vehicle with data:', req.body);
    console.log('Files received:', req.files);

    const vehicleData = {
      vehicleType: req.body.vehicleType,
      name: req.body.name,
      model: req.body.model,
      price: req.body.price,
      status: req.body.status || 'available',
    };

    // Handle images from multer
    if (req.files && req.files.length > 0) {
      vehicleData.images = req.files.map(file => bufferToBase64(file));
    }

    // Optional fields
    if (req.body.description) {
      vehicleData.description = req.body.description;
    }

    // Handle customer details if provided
    if (req.body.customerDetails) {
      try {
        vehicleData.customerDetails = JSON.parse(req.body.customerDetails);
      } catch (e) {
        console.log('Customer details not provided or invalid JSON');
      }
    }

    // Handle payment details if provided
    if (req.body.paymentDetails) {
      try {
        vehicleData.paymentDetails = JSON.parse(req.body.paymentDetails);
      } catch (e) {
        console.log('Payment details not provided or invalid JSON');
      }
    }

    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    
    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vehicle with images
// @route   PUT /api/vehicles/:id
exports.updateVehicle = async (req, res) => {
  try {
    console.log('Updating vehicle:', req.params.id);
    console.log('Update data:', req.body);
    console.log('Files received:', req.files);

    const updateData = {
      vehicleType: req.body.vehicleType,
      name: req.body.name,
      model: req.body.model,
      price: req.body.price,
      status: req.body.status,
    };

    // Handle description
    if (req.body.description) {
      updateData.description = req.body.description;
    }

    // Handle new images from multer
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => bufferToBase64(file));
      
      // Get existing vehicle to merge images
      const existingVehicle = await Vehicle.findById(req.params.id);
      if (existingVehicle && existingVehicle.images) {
        updateData.images = [...existingVehicle.images, ...newImages];
      } else {
        updateData.images = newImages;
      }
    }

    // Handle customer details if provided
    if (req.body.customerDetails) {
      try {
        updateData.customerDetails = JSON.parse(req.body.customerDetails);
      } catch (e) {
        console.log('Invalid customer details JSON');
      }
    }

    // Handle payment details if provided
    if (req.body.paymentDetails) {
      try {
        updateData.paymentDetails = JSON.parse(req.body.paymentDetails);
      } catch (e) {
        console.log('Invalid payment details JSON');
      }
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add images to existing vehicle
// @route   POST /api/vehicles/:id/images
exports.addVehicleImages = async (req, res) => {
  try {
    console.log('Adding images to vehicle:', req.params.id);
    console.log('Files received:', req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one image'
      });
    }

    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Convert new images to base64
    const newImages = req.files.map(file => bufferToBase64(file));

    // Add new images to existing ones
    vehicle.images = [...(vehicle.images || []), ...newImages];
    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle,
      message: 'Images added successfully'
    });
  } catch (error) {
    console.error('Error adding images:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove image from vehicle
// @route   DELETE /api/vehicles/images/:id/:imageIndex
exports.removeVehicleImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    
    const vehicle = await Vehicle.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if image index exists
    if (!vehicle.images || !vehicle.images[imageIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Remove the image at specified index
    vehicle.images.splice(parseInt(imageIndex), 1);
    await vehicle.save();

    res.status(200).json({
      success: true,
      data: vehicle,
      message: 'Image removed successfully'
    });
  } catch (error) {
    console.error('Error removing image:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all vehicles
// @route   GET /api/vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const { vehicleType, status, search } = req.query;
    let query = {};

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vehicle status
// @route   PATCH /api/vehicles/status/:id
exports.updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['available', 'sold out', 'soldout'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status: status === 'soldout' ? 'sold out' : status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
      message: 'Vehicle status updated successfully'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};