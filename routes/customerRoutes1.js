const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getLoans,
  payEmi,
  getProfile,
  updateProfile
} = require('../controllers/customerRoleController');

// All routes require authentication and customer role
router.use(protect);
router.use(authorize('customer'));

router.get('/dashboard', getDashboard);
router.get('/loans', getLoans);
router.post('/pay-emi/:emiId', payEmi);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;