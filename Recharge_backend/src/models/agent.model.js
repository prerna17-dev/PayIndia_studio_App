const pool = require("../config/db");

exports.getDashboardStats = async (agentId) => {
  const [[earnings]] = await pool.query(
    "SELECT SUM(amount) total FROM transactions WHERE user_id=? AND status='Success'",
    [agentId]
  );

  return {
    totalEarnings: earnings.total || 0,
  };
};
