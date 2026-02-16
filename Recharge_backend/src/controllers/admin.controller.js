const pool = require("../config/db");

exports.getStats = async (req, res) => {
  const [[users]] = await pool.query("SELECT COUNT(*) total FROM users");
  const [[txns]] = await pool.query("SELECT COUNT(*) total FROM transactions");

  res.json({
    totalUsers: users.total,
    totalTransactions: txns.total,
  });
};
