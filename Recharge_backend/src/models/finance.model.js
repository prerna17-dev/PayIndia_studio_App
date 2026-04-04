const pool = require("../config/db");

const financeModel = {
  getFinanceByMonth: async (userId, monthName, year) => {
    const [rows] = await pool.query(
      "SELECT * FROM user_finances WHERE user_id = ? AND month_name = ? AND year = ?",
      [userId, monthName, year]
    );
    return rows[0];
  },

  upsertFinance: async (userId, data) => {
    const {
      month_name,
      year,
      monthly_salary,
      total_spent,
      last_month_spent,
      bill_payments_spent,
      ott_subscriptions_spent,
      finance_spent,
      municipal_taxes_spent,
      referral_earnings,
      service_earnings,
    } = data;

    const query = `
            INSERT INTO user_finances (
                user_id, month_name, year, monthly_salary, total_spent, last_month_spent,
                bill_payments_spent, ott_subscriptions_spent, finance_spent,
                municipal_taxes_spent, referral_earnings, service_earnings
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                monthly_salary = COALESCE(?, monthly_salary),
                total_spent = COALESCE(?, total_spent),
                last_month_spent = COALESCE(?, last_month_spent),
                bill_payments_spent = COALESCE(?, bill_payments_spent),
                ott_subscriptions_spent = COALESCE(?, ott_subscriptions_spent),
                finance_spent = COALESCE(?, finance_spent),
                municipal_taxes_spent = COALESCE(?, municipal_taxes_spent),
                referral_earnings = COALESCE(?, referral_earnings),
                service_earnings = COALESCE(?, service_earnings),
                updated_at = CURRENT_TIMESTAMP
        `;

    const values = [
      userId,
      month_name,
      year,
      monthly_salary || 0.0,
      total_spent || 0.0,
      last_month_spent || 0.0,
      bill_payments_spent || 0.0,
      ott_subscriptions_spent || 0.0,
      finance_spent || 0.0,
      municipal_taxes_spent || 0.0,
      referral_earnings || 0.0,
      service_earnings || 0.0,
      monthly_salary,
      total_spent,
      last_month_spent,
      bill_payments_spent,
      ott_subscriptions_spent,
      finance_spent,
      municipal_taxes_spent,
      referral_earnings,
      service_earnings,
    ];

    await pool.query(query, values);
  },
};

module.exports = financeModel;
