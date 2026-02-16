const pool = require("../config/db");
// const { checkRechargeStatus } = require("../services/paysprint/paysprint.recharge"); // later

/**
 * Recharge Status Cron Job
 * Runs every few minutes
 */
const rechargeStatusJob = async () => {
  const conn = await pool.getConnection();
  try {
    console.log("🔄 Recharge status job started");

    const [recharges] = await conn.query(
      `SELECT r.recharge_id, r.transaction_id, r.amount, r.user_id
       FROM recharges r
       JOIN transactions t ON r.transaction_id = t.transaction_id
       WHERE t.status = 'Pending'
       ORDER BY r.created_at ASC
       LIMIT 20`
    );

    for (const recharge of recharges) {
      // 🔴 Dummy status (replace with PaySprint API)
      const apiStatus = "Success"; // Success | Failed | Pending

      if (apiStatus === "Pending") continue;

      await conn.beginTransaction();

      // Update transaction & recharge
      await conn.query(
        "UPDATE transactions SET status=? WHERE transaction_id=?",
        [apiStatus, recharge.transaction_id]
      );

      await conn.query(
        "UPDATE recharges SET status=? WHERE recharge_id=?",
        [apiStatus, recharge.recharge_id]
      );

      // Refund if failed
      if (apiStatus === "Failed") {
        await conn.query(
          "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id=?",
          [recharge.amount, recharge.user_id]
        );

        await conn.query(
          `INSERT INTO transactions 
           (user_id, transaction_type, amount, status, description)
           VALUES (?, 'Wallet_Credit', ?, 'Success', 'Recharge Refund')`,
          [recharge.user_id, recharge.amount]
        );
      }

      await conn.commit();
    }

    console.log("✅ Recharge status job completed");
  } catch (err) {
    await conn.rollback();
    console.error("❌ Recharge status job error:", err.message);
  } finally {
    conn.release();
  }
};

module.exports = rechargeStatusJob;
