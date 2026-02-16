const pool = require("../config/db");

exports.calculateCommission = (amount, percentage) => {
  return (amount * percentage) / 100;
};

// Placeholder for future commission table
exports.saveCommission = async (conn, data) => {
  // to be implemented when commission table is added
  return true;
};
