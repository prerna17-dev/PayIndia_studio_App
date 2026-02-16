const pool = require("../config/db");

exports.addBankAccount = async (userId, data) => {
  const {
    bank_id,
    account_number,
    account_holder_name,
    ifsc_code,
    linked_mobile,
  } = data;

  await pool.query(
    `INSERT INTO user_bank_accounts
     (user_id, bank_id, account_number, account_holder_name, ifsc_code, linked_mobile)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, bank_id, account_number, account_holder_name, ifsc_code, linked_mobile]
  );
};


exports.getAccountsByUser = (userId) => {
  return pool.query(
    `SELECT 
       uba.account_id,
       uba.account_number,
       uba.account_holder_name,
       uba.ifsc_code,
       uba.account_type,
       uba.linked_mobile,
       uba.is_verified,
       uba.is_primary,
       uba.verification_status,
       uba.created_at,
       b.bank_id,
       b.bank_name,
       b.bank_code,
       b.ifsc_prefix,
       b.logo_url
     FROM user_bank_accounts uba
     JOIN banks b ON b.bank_id = uba.bank_id
     WHERE uba.user_id = ?
     ORDER BY uba.created_at DESC`,
    [userId]
  );
};

exports.deleteAccountById = (userId, accountId) => {
  return pool.query(
    `DELETE FROM user_bank_accounts
     WHERE account_id = ? AND user_id = ?`,
    [accountId, userId]
  );
};



exports.getAccountById = (userId, accountId) => {
  return pool.query(
    `SELECT * FROM user_bank_accounts 
     WHERE account_id = ? AND user_id = ?`,
    [accountId, userId]
  );
};

exports.createVerificationOtp = (accountId, mobile, otp) => {
  return pool.query(
    `INSERT INTO bank_verification_otps
     (account_id, mobile_number, otp, otp_expires_at)
     VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))`,
    [accountId, mobile, otp]
  );
};

exports.getValidVerificationOtp = (accountId, otp) => {
  return pool.query(
    `SELECT * FROM bank_verification_otps
     WHERE account_id = ?
       AND otp = ?
       AND is_verified = 0
     ORDER BY verification_id DESC
     LIMIT 1`,
    [accountId, otp]
  );
};

exports.markOtpVerified = (verificationId) => {
  return pool.query(
    `UPDATE bank_verification_otps 
     SET is_verified = 1 
     WHERE verification_id = ?`,
    [verificationId]
  );
};

exports.markAccountVerified = (accountId) => {
  return pool.query(
    `UPDATE user_bank_accounts
     SET 
       is_verified = 1,
       verification_status = 'Verified',
       verification_date = NOW()
     WHERE account_id = ?`,
    [accountId]
  );
};
