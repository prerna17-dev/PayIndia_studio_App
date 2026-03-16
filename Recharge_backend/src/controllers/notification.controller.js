const NotificationModel = require("../models/notification.model");

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Corrected to use req.user.userId based on standard setup
    const notifications = await NotificationModel.getNotificationsByUserId(userId);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    await NotificationModel.markAsRead(notificationId, userId);
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await NotificationModel.markAllAsRead(userId);
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

