// // routes/paymentRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const {
//   createOrder,
//   verifyPayment,
//   getPaymentStatus
// } = require('../controllers/paymentController');

// router.use(protect);

// router.post('/create-order', createOrder);
// router.post('/verify', verifyPayment);
// router.get('/status/:orderId', getPaymentStatus);

// module.exports = router;


// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getConfigStatus
} = require('../controllers/paymentController');

// Public status endpoint (no auth needed)
router.get('/config-status', getConfigStatus);

// Protected routes
router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;