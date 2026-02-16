const pool = require("../config/db");

exports.create = async (conn, data) => {
  const { user_id, transaction_id, recharge_number, operator, amount } = data;

  const [result] = await conn.query(
    `INSERT INTO recharges 
     (user_id, transaction_id, recharge_number, operator, amount)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, transaction_id, recharge_number, operator, amount]
  );

  return result.insertId;
};

exports.updateStatus = async (conn, rechargeId, status, apiResponse = null) => {
  await conn.query(
    "UPDATE recharges SET status=?, api_response=? WHERE recharge_id=?",
    [status, apiResponse, rechargeId]
  );
};
