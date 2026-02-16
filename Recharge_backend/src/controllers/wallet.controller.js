const pool = require("../config/db");

exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [[user]] = await pool.query(
      "SELECT wallet_balance FROM users WHERE user_id=?",
      [userId]
    );

    res.json({ balance: user.wallet_balance });
  } catch {
    res.status(500).json({ message: "Failed to fetch balance" });
  }
};
