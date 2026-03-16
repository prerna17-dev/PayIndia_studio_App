const paysprintBill = require("../services/paysprint/paysprint.bill");
const pool = require("../config/db");

/**
 * GET Bill Operators
 */
exports.getOperators = async (req, res) => {
  try {
    const data = await paysprintBill.getBillOperators();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch bill operators",
      error: err.response?.data || err.message,
    });
  }
};

/**
 * Fetch Bill
 */
exports.fetchBill = async (req, res) => {
  try {
    const data = await paysprintBill.fetchBill(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch bill",
      error: err.response?.data || err.message,
    });
  }
};

/**
 * Pay Bill
 */
exports.payBill = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { operator, canumber, amount, referenceid, latitude, longitude } = req.body;
    const userId = req.user.userId;

    if (!operator || !canumber || !amount || !referenceid) {
      return res.status(400).json({
        message: "operator, canumber, amount, referenceid required"
      });
    }

    await conn.beginTransaction();

    // 1️⃣ Check Operator
    const [opRows] = await conn.query(
      "SELECT operator_id FROM operators WHERE operator_id=? OR operator_code=? LIMIT 1",
      [operator, operator]
    );

    if (opRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Invalid operator" });
    }

    const operatorId = opRows[0].operator_id;

    // 2️⃣ Check Wallet Balance
    const [[user]] = await conn.query(
      "SELECT wallet_balance FROM users WHERE user_id=? FOR UPDATE",
      [userId]
    );

    if (user.wallet_balance < amount) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 3️⃣ Deduct Wallet
    await conn.query(
      "UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id=?",
      [amount, userId]
    );

    // 4️⃣ Insert Transaction
    const [txn] = await conn.query(
      `INSERT INTO transactions 
      (user_id, transaction_type, amount, description, status, transaction_reference)
      VALUES (?, 'Bill', ?, ?, 'Pending', ?)`,
      [userId, amount, `Bill Payment for A/C ${canumber}`, referenceid]
    );

    // 5️⃣ Insert Payment Method
    await conn.query(
      `INSERT INTO payment_methods
      (transaction_id, payment_type, amount, payment_status)
      VALUES (?, 'Wallet', ?, 'Pending')`,
      [txn.insertId, amount]
    );

    // 6️⃣ Insert Bill Payment Record
    await conn.query(
      `INSERT INTO bill_payments
(user_id, transaction_id, operator_id, consumer_number, amount, latitude, longitude, status)
VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [userId, txn.insertId, operatorId, canumber, amount, latitude, longitude]
    );

    await conn.commit();

    // 7️⃣ Call PaySprint
    try {

      const apiResponse = await paysprintBill.payBill({
        operator,
        canumber,
        amount,
        referenceid,
        latitude,
        longitude
      });

      // ✅ CHECK REAL STATUS FROM API
      if (apiResponse.status === true) {

        await pool.query(
          "UPDATE transactions SET status='Success' WHERE transaction_id=?",
          [txn.insertId]
        );

        await pool.query(
          "UPDATE payment_methods SET payment_status='Success' WHERE transaction_id=?",
          [txn.insertId]
        );

        await pool.query(
          "UPDATE bill_payments SET status='Success', api_response=? WHERE transaction_id=?",
          [JSON.stringify(apiResponse), txn.insertId]
        );

        return res.json({
          message: "Bill payment successful",
          transactionId: txn.insertId,
          apiResponse
        });

      } else {

        // ❌ API returned failure
        await pool.query(
          "UPDATE transactions SET status='Failed' WHERE transaction_id=?",
          [txn.insertId]
        );

        await pool.query(
          "UPDATE payment_methods SET payment_status='Failed' WHERE transaction_id=?",
          [txn.insertId]
        );

        await pool.query(
          "UPDATE bill_payments SET status='Failed', api_response=? WHERE transaction_id=?",
          [JSON.stringify(apiResponse), txn.insertId]
        );

        return res.status(400).json({
          message: "Bill payment failed",
          transactionId: txn.insertId,
          error: apiResponse
        });
      }

    } catch (apiErr) {

      // FAILED
      await pool.query(
        "UPDATE transactions SET status='Failed' WHERE transaction_id=?",
        [txn.insertId]
      );

      await pool.query(
        "UPDATE payment_methods SET payment_status='Failed' WHERE transaction_id=?",
        [txn.insertId]
      );

      await pool.query(
        "UPDATE bill_payments SET status='Failed', api_response=? WHERE transaction_id=?",
        [JSON.stringify(apiErr.response?.data || apiErr.message), txn.insertId]
      );

      res.status(500).json({
        message: "Bill payment failed",
        transactionId: txn.insertId,
        error: apiErr.response?.data || apiErr.message
      });
    }

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Bill payment failed" });
  } finally {
    conn.release();
  }
};


/**
 * Bill Status
 */
exports.statusEnquiry = async (req, res) => {
  try {
    const { referenceid } = req.body;

    if (!referenceid) {
      return res.status(400).json({ message: "referenceid is required" });
    }

    const data = await paysprintBill.checkBillStatus(referenceid);
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Unable to check bill status",
      error: err.response?.data || err.message,
    });
  }
};
