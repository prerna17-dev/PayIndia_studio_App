const pool = require("../config/db");

exports.debitWallet = async (conn, userId, amount) => {
  const [[user]] = await conn.query(
    "SELECT wallet_balance FROM users WHERE user_id=? FOR UPDATE",
    [userId]
  );

  if (user.wallet_balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  await conn.query(
    "UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id=?",
    [amount, userId]
  );
};

exports.creditWallet = async (conn, userId, amount) => {
  await conn.query(
    "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id=?",
    [amount, userId]
  );
};
