const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;