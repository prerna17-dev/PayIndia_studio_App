exports.createTransaction = async (conn, data) => {
  const { user_id, type, amount, status, description } = data;

  const [result] = await conn.query(
    `INSERT INTO transactions
     (user_id, transaction_type, amount, status, description)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, type, amount, status, description]
  );

  return result.insertId;
};

exports.updateTransactionStatus = async (conn, transactionId, status) => {
  await conn.query(
    "UPDATE transactions SET status=? WHERE transaction_id=?",
    [status, transactionId]
  );
};
