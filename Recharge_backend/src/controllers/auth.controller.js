const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const notificationService = require("../services/notification.service");

const generateOTP = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

exports.sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile required" });

    console.log(`[AUTH] Generating OTP for ${mobile}...`);
    const otp = generateOTP();

    await pool.query(
      `INSERT INTO login_sessions 
      (mobile_number, otp, otp_generated_at, otp_expires_at)
      VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [mobile, otp]
    );

    console.log("OTP (dev):", otp);

    // DLT Template: Your password has been successfully reset. Please log in with your new password: {#var#} - WRKNAI, Namastey
    const message = `Your password has been successfully reset. Please log in with your new password: ${otp} - WRKNAI, Namastey`;

    // Send SMS via Dreamz Technology API
    const smsResult = await notificationService.sendSMS(mobile, message);

    if (typeof smsResult === 'string' && smsResult.startsWith('error')) {
      console.error("❌ SMS API ERROR:", smsResult);
      return res.status(500).json({
        message: "SMS provider error",
        error: smsResult
      });
    }

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("❌ SEND OTP ERROR:", err);
    res.status(500).json({ message: "OTP send failed" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing. Ensure Content-Type is application/json" });
    }
    const { mobile, otp, referralCode } = req.body;

    // 1️⃣ get latest OTP (do NOT block by expiry here)
    const [rows] = await pool.query(
      `SELECT * FROM login_sessions
       WHERE mobile_number = ?
       AND otp = ?
       AND is_verified = 0
       ORDER BY session_id DESC
       LIMIT 1`,
      [mobile, otp]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const session = rows[0];

    // 2️⃣ manual expiry check (safer)
    if (new Date(session.otp_expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // 3️⃣ mark OTP verified
    await pool.query(
      `UPDATE login_sessions SET is_verified = 1 WHERE session_id = ?`,
      [session.session_id]
    );

    // 4️⃣ fetch user
    const [users] = await pool.query(
      `SELECT user_id, role, referral_code FROM users WHERE mobile_number = ?`,
      [mobile]
    );

    let userId, role;
    let isNewUser = false;

    if (!users.length) {
      isNewUser = true;
      // Generate a unique referral code for the new user
      const newReferralCode = "PAY" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const [result] = await pool.query(
        `INSERT INTO users (mobile_number, role, referral_code) VALUES (?, 'USER', ?)`,
        [mobile, newReferralCode]
      );
      userId = result.insertId;
      role = "USER";

      // If user signed up with a referral code, record it
      if (referralCode) {
        try {
          const [referrer] = await pool.query(
            `SELECT user_id FROM users WHERE referral_code = ?`,
            [referralCode]
          );

          if (referrer.length > 0) {
            await pool.query(
              `INSERT INTO referrals (referrer_id, referred_user_id, status) VALUES (?, ?, 'PENDING')`,
              [referrer[0].user_id, userId]
            );
            console.log(`[REFERRAL] User ${userId} referred by ${referrer[0].user_id}`);
          }
        } catch (refErr) {
          console.error("Error processing referral:", refErr);
          // Don't fail login because referral processing failed
        }
      }
    } else {
      userId = users[0].user_id;
      role = users[0].role || "USER";

      // If existing user doesn't have a referral code, generate one now
      if (!users[0].referral_code) {
        const newReferralCode = "PAY" + Math.random().toString(36).substring(2, 8).toUpperCase();
        await pool.query(
          `UPDATE users SET referral_code = ? WHERE user_id = ?`,
          [newReferralCode, userId]
        );
      }
    }

    // 5️⃣ generate JWT WITH ROLE
    const token = jwt.sign(
      { userId, mobile, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Fetch user details again to send back (including the new referral_code)
    const [[updatedUser]] = await pool.query(
      `SELECT user_id, name, mobile_number, role, referral_code FROM users WHERE user_id = ?`,
      [userId]
    );

    return res.json({
      message: isNewUser ? "Signup successful" : "Login successful",
      token,
      user: updatedUser
    });
  } catch (err) {
    console.error("❌ VERIFY OTP ERROR:", err);
    return res.status(500).json({
      message: "Login failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Token required" });
  }

  await pool.query(
    `UPDATE login_sessions
     SET session_token = NULL
     WHERE session_token = ?`,
    [token]
  );

  res.json({ message: "Logout successful" });
};
