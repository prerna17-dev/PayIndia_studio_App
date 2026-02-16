const pool = require("../config/db");

exports.create = async (conn, data) => {
  const { user_id, transaction_type, amount, status, description } = data;

  const [result] = await conn.query(
    `INSERT INTO transactions 
     (user_id, transaction_type, amount, status, description)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, transaction_type, amount, status, description]
  );

  return result.insertId;
};

exports.updateStatus = async (conn, transactionId, status) => {
  await conn.query(
    "UPDATE transactions SET status=? WHERE transaction_id=?",
    [status, transactionId]
  );
};

exports.getPending = async (limit = 20) => {
  const [rows] = await pool.query(
    "SELECT * FROM transactions WHERE status='Pending' LIMIT ?",
    [limit]
  );
  return rows;
};

  