const pool = require("../config/db");

exports.findByMobile = async (mobile) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE mobile_number = ?",
    [mobile]
  );
  return rows[0];
};

exports.findById = async (userId) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE user_id = ?",
    [userId]
  );
  return rows[0];
};

exports.create = async (mobile) => {
  const [result] = await pool.query(
    "INSERT INTO users (mobile_number) VALUES (?)",
    [mobile]
  );
  return result.insertId;
};

exports.updateProfile = async (userId, data) => {
  const { name, gender, date_of_birth, profile_image } = data;

  await pool.query(
    `UPDATE users
     SET 
       name = COALESCE(?, name),
       gender = COALESCE(?, gender),
       date_of_birth = COALESCE(?, date_of_birth),
       profile_image = COALESCE(?, profile_image)
     WHERE user_id = ?`,
    [
      name ?? null,
      gender ?? null,
      date_of_birth ?? null,
      profile_image ?? null,
      userId,
    ]
  );
};


exports.getUserById = (userId) => {
  return pool.query(
    `SELECT 
       user_id,
       mobile_number,
       name,
       gender,
       date_of_birth,
       profile_image,
       wallet_balance,
       role,
       is_active,
       created_at
     FROM users
     WHERE user_id = ?`,
    [userId]
  );
};