// routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivity,
  getSalesOverview
} = require('../controllers/dashboardController');

router.route('/stats').get(getDashboardStats);
router.route('/activity').get(getRecentActivity);
router.route('/sales-overview').get(getSalesOverview);


module.exports = router;