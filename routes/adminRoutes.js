const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all users (Admin only)
// @route   GET /api/auth/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -resetPasswordOTP -resetPasswordExpires')
      .populate('agentDetails.supervisor', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/auth/admin/users/:id
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordOTP -resetPasswordExpires')
      .populate('agentDetails.supervisor', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/auth/admin/users/:id
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordOTP -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/admin/users/:id
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Toggle user status (Admin only)
// @route   PATCH /api/auth/admin/users/:id/toggle-status
router.patch('/users/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});



// lskfjsdjklf
// @desc    Get customer login credentials
// @route   GET /api/auth/admin/customers/:id/credentials
router.get('/customers/:id/credentials', protect, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('userId', 'email');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Note: We cannot retrieve the actual password for security reasons
    // Instead, provide a password reset link functionality
    res.status(200).json({
      success: true,
      data: {
        email: customer.email,
        message: 'Use "Forgot Password" feature to reset password'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Reset customer password (admin)
// @route   POST /api/auth/admin/customers/:id/reset-password
router.post('/customers/:id/reset-password', protect, adminOnly, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('userId');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Generate new random password
    const newPassword = Math.random().toString(36).slice(-8) + '@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    await User.findByIdAndUpdate(customer.userId._id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      data: {
        email: customer.email,
        newPassword: newPassword,
        message: 'Password reset successful'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;