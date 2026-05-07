const Notification = require('../models/Notification');

// @desc    Get user's notifications
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;
    
    const query = { userId: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        total,
        unreadCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};