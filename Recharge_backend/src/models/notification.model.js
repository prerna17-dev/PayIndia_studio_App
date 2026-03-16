const pool = require("../config/db");

class NotificationModel {
  static async getNotificationsByUserId(userId) {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  static async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await pool.query(query, [notificationId, userId]);
    return result;
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET is_read = TRUE 
      WHERE user_id = ? AND is_read = FALSE
    `;
    const [result] = await pool.query(query, [userId]);
    return result;
  }

  static async createNotification(userId, title, message, type = "info") {
    const query = `
      INSERT INTO notifications (user_id, title, message, type) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [userId, title, message, type]);
    return result;
  }
}

module.exports = NotificationModel;
