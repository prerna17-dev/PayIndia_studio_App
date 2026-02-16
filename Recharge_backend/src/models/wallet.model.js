const pool = require("../config/db");

exports.getBalanceForUpdate = async (conn, userId) => {
  const [[row]] = await conn.query(
    "SELECT wallet_balance FROM users WHERE user_id=? FOR UPDATE",
    [userId]
  );
  return row.wallet_balance;
};

exports.debit = async (conn, userId, amount) => {
  await conn.query(
    "UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id=?",
    [amount, userId]
  );
};

exports.credit = async (conn, userId, amount) => {
  await conn.query(
    "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id=?",
    [amount, userId]
  );
};
