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


