const pool = require("../config/db");

/**
 * Settlement Job
 * Runs once per day (night)
 */
const settlementJob = async () => {
  try {
    console.log("📦 Settlement job started");

    const [rows] = await pool.query(
      `SELECT 
        DATE(created_at) as settlement_date,
        COUNT(*) total_transactions,
        SUM(amount) total_amount
       FROM transactions
       WHERE status = 'Success'
       GROUP BY DATE(created_at)`
    );

    // Later: store into settlements table
    console.log("Settlement Summary:", rows);

    console.log("✅ Settlement job completed");
  } catch (err) {
    console.error("❌ Settlement job failed:", err.message);
  }
};

module.exports = settlementJob;
