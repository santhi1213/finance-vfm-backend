// const express = require('express');
// const router = express.Router();
// const {
//   createSale,
//   getAllSales,
//   getSaleById,
//   updateSale,
//   deleteSale,
//   getSalesByCustomer,
//   getSalesByAgent,
//   getSalesStats
// } = require('../controllers/saleController');

// // Public routes (no authentication required as per your requirement)
// router.route('/')
//   .get(getAllSales)
//   .post(createSale);

// router.route('/stats')
//   .get(getSalesStats);

// router.route('/customer/:customerId')
//   .get(getSalesByCustomer);

// router.route('/agent/:agentId')
//   .get(getSalesByAgent);

// router.route('/:id')
//   .get(getSaleById)
//   .put(updateSale)
//   .delete(deleteSale);

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesByCustomer,
  getSalesByAgent,
  getSalesStats
} = require('../controllers/saleController');

// Public routes (no authentication required as per your requirement)
router.route('/')
  .get(getAllSales)
  .post(createSale);

router.route('/stats')
  .get(getSalesStats);

router.route('/customer/:customerId')
  .get(getSalesByCustomer);

router.route('/agent/:agentId')
  .get(getSalesByAgent);

router.route('/:id')
  .get(getSaleById)
  .put(updateSale)
  .delete(deleteSale);

module.exports = router;

