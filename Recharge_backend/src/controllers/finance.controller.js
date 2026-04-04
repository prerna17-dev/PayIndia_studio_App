const financeModel = require("../models/finance.model");

exports.getFinanceData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month, year } = req.params;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }

    const data = await financeModel.getFinanceByMonth(userId, month, year);

    if (!data) {
      return res.json({
        success: true,
        data: {
          monthly_salary: 0.0,
          total_spent: 0.0,
          last_month_spent: 0.0,
          bill_payments_spent: 0.0,
          ott_subscriptions_spent: 0.0,
          finance_spent: 0.0,
          municipal_taxes_spent: 0.0,
          referral_earnings: 0.0,
          service_earnings: 0.0,
        },
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Get Finance Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch finance data" });
  }
};

exports.updateFinanceData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    if (!data.month_name || !data.year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }

    await financeModel.upsertFinance(userId, data);

    res.json({ success: true, message: "Finance data updated successfully" });
  } catch (err) {
    console.error("Update Finance Error:", err);
    res.status(500).json({ success: false, message: "Failed to update finance data" });
  }
};
