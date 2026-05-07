const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboard,
  getAssignedCustomers,
  getCollections,
  collectEmi,
  getProfile,
  updateProfile
} = require('../controllers/agentRoleController');

// All routes require authentication and agent role
router.use(protect);
router.use(authorize('agent'));

router.get('/dashboard', getDashboard);
router.get('/customers', getAssignedCustomers);
router.get('/collections', getCollections);
router.post('/collect-emi/:emiId', collectEmi);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;