// const express = require('express');
// const router = express.Router();
// const {
//   createCustomer,
//   getAllCustomers,
//   getCustomerById,
//   updateCustomer,
//   deleteCustomer,
//   hardDeleteCustomer,
//   getCustomersByAgent,
//   toggleCustomerStatus
// } = require('../controllers/customerController');
// const { protect, authorize, agentOrAdmin } = require('../middleware/auth');

// // All routes require authentication
// router.use(protect);

// // Customer routes
// router.route('/')
//   .get(authorize('admin', 'agent'), getAllCustomers)
//   .post(authorize('admin', 'agent'), createCustomer);

// router.route('/:id')
//   .get(authorize('admin', 'agent'), getCustomerById)
//   .put(authorize('admin', 'agent'), updateCustomer)
//   .delete(authorize('admin', 'agent'), deleteCustomer);

// // Hard delete (admin only)
// router.delete('/:id/hard', authorize('admin'), hardDeleteCustomer);

// // Get customers by agent
// router.get('/agent/:agentId', authorize('admin', 'agent'), getCustomersByAgent);

// // Toggle customer status (admin only)
// router.patch('/:id/toggle-status', authorize('admin'), toggleCustomerStatus);

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getAllCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(deleteCustomer);

router.patch('/:id/toggle-status', toggleCustomerStatus);

module.exports = router;