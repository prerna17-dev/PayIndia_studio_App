const pool = require("../config/db");

exports.getReferralsInfo = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get user's referral code and stats
    const [userRows] = await pool.query(
      "SELECT referral_code FROM users WHERE user_id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const referralCode = userRows[0].referral_code;

    // 2. Get referral stats (Total, Successful, Total Earnings)
    const [statsRows] = await pool.query(
      `SELECT 
        COUNT(*) as total_referrals,
        SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_referrals,
        SUM(reward_amount) as total_earnings
       FROM referrals 
       WHERE referrer_id = ?`,
      [userId]
    );

    const stats = {
      total_referrals: statsRows[0].total_referrals || 0,
      successful_referrals: statsRows[0].successful_referrals || 0,
      total_earnings: statsRows[0].total_earnings || 0
    };

    // 3. Get recent referrals list with joined user info
    const [referralList] = await pool.query(
      `SELECT 
        r.referral_id,
        r.status,
        r.reward_amount,
        r.created_at,
        u.name as referred_user_name,
        u.mobile_number as referred_user_mobile
       FROM referrals r
       JOIN users u ON r.referred_user_id = u.user_id
       WHERE r.referrer_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      referralCode,
      stats,
      recentReferrals: referralList
    });

  } catch (error) {
    console.error("Get Referrals Info Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch referral info" });
  }
};
