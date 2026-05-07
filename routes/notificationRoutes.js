const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;