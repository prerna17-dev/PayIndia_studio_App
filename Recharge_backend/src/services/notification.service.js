const smsService = require('./sms.service');

exports.sendSMS = async (mobile, message, options = {}) => {
  try {
    return await smsService.sendSMS(mobile, message, options);
  } catch (error) {
    console.error(`Failed to send SMS to ${mobile}:`, error.message);
    return false;
  }
};

exports.sendNotification = async (userId, message) => {
  console.log(`🔔 Notification to user ${userId}: ${message}`);
  return true;
};
