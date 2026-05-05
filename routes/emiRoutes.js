// const express = require('express');
// const router = express.Router();
// const {
//   getAllEmis,
//   getEmiById,
//   getEmisBySale,
//   getEmisByCustomer,
//   payEmi,
//   getEmiStats,
//   sendEmiReminder
// } = require('../controllers/emiController');

// // ============ CORS Preflight Handlers ============
// // Handle OPTIONS preflight requests for all routes
// router.options('/', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.status(200).end();
// });

// router.options('/stats', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.status(200).end();
// });

// router.options('/sale/:saleId', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.status(200).end();
// });

// router.options('/customer/:customerId', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.status(200).end();
// });

// router.options('/:id', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.status(200).end();
// });

// // IMPORTANT: Handle OPTIONS for the pay endpoint (PATCH method)
// router.options('/:id/pay', (req, res) => {
//   console.log('OPTIONS request received for /:id/pay');
//   const origin = req.headers.origin;
  
//   // Set CORS headers for preflight
//   res.header('Access-Control-Allow-Origin', origin || '*');
//   res.header('Access-Control-Allow-Methods', 'PATCH, POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Max-Age', '86400'); // 24 hours cache for preflight
  
//   console.log('OPTIONS response sent with headers:', {
//     'Access-Control-Allow-Origin': origin,
//     'Access-Control-Allow-Methods': 'PATCH, POST, OPTIONS'
//   });
  
//   res.status(200).end();
// });

// router.options('/:id/remind', (req, res) => {
//   res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.status(200).end();
// });

// // ============ Actual Route Handlers ============
// // Public routes (no authentication required)
// router.route('/')
//   .get(getAllEmis);

// router.route('/stats')
//   .get(getEmiStats);

// router.route('/sale/:saleId')
//   .get(getEmisBySale);

// router.route('/customer/:customerId')
//   .get(getEmisByCustomer);

// router.route('/:id')
//   .get(getEmiById);

// // Important: Add both PATCH and OPTIONS handlers for the pay endpoint
// router.route('/:id/pay')
//   .patch(payEmi);

// router.route('/:id/remind')
//   .post(sendEmiReminder);

// module.exports = router;



const express = require('express');
const router = express.Router();
const {
  getAllEmis,
  getEmiById,
  getEmisBySale,
  getEmisByCustomer,
  payEmi,
  getEmiStats,
  sendEmiReminder
} = require('../controllers/emiController');

// Just the routes - no OPTIONS handlers
router.route('/')
  .get(getAllEmis);

router.route('/stats')
  .get(getEmiStats);

router.route('/sale/:saleId')
  .get(getEmisBySale);

router.route('/customer/:customerId')
  .get(getEmisByCustomer);

router.route('/:id')
  .get(getEmiById);

router.route('/:id/pay')
  .put(payEmi);

router.route('/:id/remind')
  .post(sendEmiReminder);

module.exports = router;


