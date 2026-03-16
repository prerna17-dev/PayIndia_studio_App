const pool = require("../config/db");
const userModel = require("../models/user.model");

exports.getProfile = async (req, res) => {
  const userId = req.user.userId;

  const [[user]] = await userModel.getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;

  let { name, gender, user_email, date_of_birth, profile_image } = req.body;

  if (req.file) {
    profile_image = `/uploads/${req.file.filename}`;
  }


  await userModel.updateProfile(userId, {
    name,
    gender,
    user_email,
    date_of_birth,
    profile_image,
  });

  res.json({ message: "Profile updated successfully" });
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      `SELECT transaction_id, transaction_type, amount, description, status, transaction_reference, created_at
       FROM transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Get Transactions Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};
