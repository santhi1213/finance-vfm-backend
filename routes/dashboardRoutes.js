// routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivity,
  getSalesOverview
} = require('../controllers/dashboardController');

// router.get('/stats', getDashboardStats);
router.route('/stats').get(getDashboardStats);
router.route('/activity').get(getRecentActivity);
router.route('/sales-overview').get(getSalesOverview);
// router.get('/activity', getRecentActivity);
// router.get('/sales-overview', getSalesOverview);

module.exports = router;