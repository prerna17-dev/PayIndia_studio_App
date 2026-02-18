const pool = require("../config/db");
const operatorService = require("../services/operator.service");
const paysprintRecharge = require("../services/paysprint/paysprint.recharge");

/**
 * POST /api/recharge/mobile
 * Body: { operator, number, amount, referenceid }
 */
exports.mobileRecharge = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { operator, number, amount, referenceid } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!operator || !number || !amount || !referenceid) {
      return res.status(400).json({
        message: "Missing required fields: operator, number, amount, referenceid",
      });
    }

    // Resolve Operator (ID or PaySprint Code)
    const [opRows] = await conn.query(
      "SELECT operator_code, operator_name, is_active FROM operators WHERE operator_id = ? OR operator_code = ? LIMIT 1",
      [operator, operator]
    );

    if (opRows.length === 0) {
      return res.status(400).json({ message: "Invalid Operator ID or Code" });
    }

    if (!opRows[0].is_active) {
      return res.status(400).json({ message: "Operator is temporarily inactive" });
    }

    const operatorCode = opRows[0].operator_code;
    const operatorName = opRows[0].operator_name;

    await conn.beginTransaction();

    // Check wallet balance
    const [[user]] = await conn.query(
      "SELECT wallet_balance FROM users WHERE user_id=? FOR UPDATE",
      [userId]
    );

    if (user.wallet_balance < amount) {
      await conn.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct wallet
    await conn.query(
      "UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id=?",
      [amount, userId]
    );

    // Create transaction record
    const [txn] = await conn.query(
      `INSERT INTO transactions 
      (user_id, transaction_type, amount, status)
      VALUES (?, 'Recharge', ?, 'Pending')`,
      [userId, amount]
    );

    // ✅ ADD PAYMENT METHOD ENTRY (MISSING PART)
    await conn.query(
      `INSERT INTO payment_methods
   (transaction_id, payment_type, amount, payment_status)
   VALUES (?, 'Wallet', ?, 'Pending')`,
      [txn.insertId, amount]
    );


    // Create recharge record
    await conn.query(
      `INSERT INTO recharges 
   (user_id, transaction_id, operator, recharge_number, amount)
   VALUES (?, ?, ?, ?, ?)`,
      [userId, txn.insertId, operatorCode, number, amount]
    );
    await conn.commit();

    // Call PaySprint API
    try {
      const paysprintResponse = await paysprintRecharge.mobileRecharge({
        operator: operatorCode,
        number,
        amount,
        referenceid,
      });

      res.json({
        message: "Recharge initiated",
        transactionId: txn.insertId,
        paysprint: paysprintResponse,
      });
    } catch (apiErr) {
      // PaySprint failed but money already deducted — mark as failed
      console.error("PaySprint API failed after deduction:", apiErr.message);
      await pool.query(
        "UPDATE transactions SET status='Failed' WHERE transaction_id=?",
        [txn.insertId]
      );

      await pool.query(
        "UPDATE payment_methods SET payment_status='Failed' WHERE transaction_id=?",
        [txn.insertId]
      );

      let statusCode = 502;
      let errorMessage = "Recharge failed at payment gateway";
      let details = apiErr.message;

      if (apiErr.response) {
        statusCode = apiErr.response.status;
        errorMessage = apiErr.response.data?.message || errorMessage;
        details = apiErr.response.data;
      }

      res.status(statusCode).json({
        message: errorMessage,
        transactionId: txn.insertId,
        error: details,
      });
    }
  } catch (err) {
    await conn.rollback();
    console.error("Recharge Error:", err.message);
    res.status(500).json({ message: "Recharge failed" });
  } finally {
    conn.release();
  }
};

/**
 * POST /api/recharge/operators
 * Fetch operator list from PaySprint
 */
exports.getOperators = async (req, res) => {
  try {
    const data = await operatorService.fetchOperators();
    res.json(data);
  } catch (err) {
    console.error("Get Operators Error:", err.message);
    res.status(500).json({
      message: "Unable to fetch operators",
    });
  }
};

/**
 * POST /api/recharge/status
 * Body: { referenceid }
 * Check recharge status from PaySprint
 */
exports.statusEnquiry = async (req, res) => {
  try {
    const { referenceid } = req.body;

    if (!referenceid) {
      return res.status(400).json({ message: "referenceid is required" });
    }

    const data = await paysprintRecharge.checkRechargeStatus(referenceid);
    res.json(data);
  } catch (err) {
    console.error("Status Enquiry Error:", err.message);
    res.status(500).json({
      message: "Unable to check recharge status",
    });
  }
};

/**
 * Seed Operators from PaySprint
 * POST /api/recharge/seed-operators
 */
exports.seedOperators = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // 1. Fetch from PaySprint
    const data = await operatorService.fetchOperators();

    // Check correct structure: { responsecode: 1, status: true, data: [...] }
    if (!data.data || !Array.isArray(data.data)) {
      console.error("Invalid Operator API Response:", JSON.stringify(data));
      return res.status(500).json({ message: "Invalid response from PaySprint Operator API" });
    }

    const operators = data.data; // Array of operators

    await conn.beginTransaction();

    // 2. Insert/Update operators
    let count = 0;
    for (const op of operators) {
      // op structure: { id, name, category }
      // table: operator_code, operator_name, service_type, is_active

      // Map category to service_type (ENUM: 'MOBILE', 'DTH', 'ELECTRICITY')
      let serviceType = op.category ? op.category.toUpperCase() : '';
      if (serviceType === 'PREPAID' || serviceType === 'POSTPAID') {
        serviceType = 'MOBILE';
      }

      // Use INSERT INTO ... ON DUPLICATE KEY UPDATE. 
      // We assume operator_code is unique.
      await conn.query(
        `INSERT INTO operators (operator_code, operator_name, service_type, is_active) 
             VALUES (?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE 
                operator_name=VALUES(operator_name), 
                service_type=VALUES(service_type),
                is_active=1`,
        [op.id, op.name, serviceType]
      );
      count++;
    }

    await conn.commit();
    res.json({ message: `Successfully seeded ${count} operators`, total: operators.length });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Seed Operators Error:", err.message);
    res.status(500).json({ message: "Failed to seed operators", error: err.message });
  } finally {
    if (conn) conn.release();
  }
};
