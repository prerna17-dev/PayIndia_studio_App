exports.sendSMS = async (mobile, message) => {
  console.log(`📩 SMS to ${mobile}: ${message}`);
  return true;
};

exports.sendNotification = async (userId, message) => {
  console.log(`🔔 Notification to user ${userId}: ${message}`);
  return true;
};
