const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile required" });

    const otp = generateOTP();

    await pool.query(
      `INSERT INTO login_sessions 
      (mobile_number, otp, otp_generated_at, otp_expires_at)
      VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
      [mobile, otp]
    );

    console.log("OTP (dev):", otp); // integrate SMS later

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP send failed" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

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
      `SELECT user_id, role FROM users WHERE mobile_number = ?`,
      [mobile]
    );

    let userId, role;

    if (!users.length) {
      const [result] = await pool.query(
        `INSERT INTO users (mobile_number, role) VALUES (?, 'USER')`,
        [mobile]
      );
      userId = result.insertId;
      role = "USER";
    } else {
      userId = users[0].user_id;
      role = users[0].role || "USER";
    }

    // 5️⃣ generate JWT WITH ROLE
    const token = jwt.sign(
      { userId, mobile, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("❌ VERIFY OTP ERROR:", err.message);
    return res.status(500).json({ message: "Login failed" });
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
