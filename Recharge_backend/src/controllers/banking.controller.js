const pool = require("../config/db");
const bankingModel = require("../models/banking.model");

exports.addBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      bank_id,
      account_number,
      account_holder_name,
      ifsc_code,
      linked_mobile,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO user_bank_accounts
      (user_id, bank_id, account_number, account_holder_name, ifsc_code, linked_mobile)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        bank_id,
        account_number,
        account_holder_name,
        ifsc_code,
        linked_mobile,
      ]
    );

    res.json({
      message: "Bank account added successfully",
      account_id: result.insertId
    });
  } catch (err) {
    console.error("Add bank account error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAccounts = async (req, res) => {
  const userId = req.user.userId;

  const [accounts] = await bankingModel.getAccountsByUser(userId);
  res.json(accounts);
};

exports.removeBankAccount = async (req, res) => {
  const userId = req.user.userId;
  const { account_id } = req.body;

  if (!account_id) {
    return res.status(400).json({ message: "account_id is required" });
  }

  const [result] = await bankingModel.deleteAccountById(userId, account_id);

  if (result.affectedRows === 0) {
    return res
      .status(404)
      .json({ message: "Bank account not found or not allowed" });
  }

  res.json({ message: "Bank account removed successfully" });
};



const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * STEP 1: Send verification OTP
 * POST /api/banking/verify-account
 */
exports.verifyAccount = async (req, res) => {
  const userId = req.user.userId;
  const { account_id } = req.body;

  if (!account_id) {
    return res.status(400).json({ message: "account_id is required" });
  }

  const [[account]] = await bankingModel.getAccountById(userId, account_id);
  if (!account) {
    return res.status(404).json({ message: "Bank account not found" });
  }

  if (account.is_verified) {
    return res.status(400).json({ message: "Account already verified" });
  }

  const otp = generateOTP();

  await bankingModel.createVerificationOtp(
    account_id,
    account.linked_mobile,
    otp
  );

  // DEV only – replace with SMS gateway
  console.log("Bank Verification OTP:", otp);

  res.json({ message: "OTP sent for bank account verification" });
};

/**
 * STEP 2: Verify OTP
 * POST /api/banking/verify-otp
 */
exports.verifyBankOtp = async (req, res) => {
  const userId = req.user.userId;
  const { account_id, otp } = req.body;

  if (!account_id || !otp) {
    return res.status(400).json({ message: "account_id and otp are required" });
  }

  const [[account]] = await bankingModel.getAccountById(userId, account_id);
  if (!account) {
    return res.status(404).json({ message: "Bank account not found" });
  }

  const [[row]] = await bankingModel.getValidVerificationOtp(account_id, otp);

  if (!row) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (new Date(row.otp_expires_at) < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  await bankingModel.markOtpVerified(row.verification_id);
  await bankingModel.markAccountVerified(account_id);

  res.json({ message: "Bank account verified successfully" });
};

/**
 * Seed Banks from PaySprint
 * POST /api/banking/seed-banks
 */
exports.seedBanks = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    // 1. Fetch from PaySprint
    const data = await require("../services/paysprint/paysprint.banking").fetchBankList();

    // Check correct structure based on inspection
    if (!data.banklist || !data.banklist.data) {
      console.error("Invalid PaySprint Response:", JSON.stringify(data));
      return res.status(500).json({ message: "Invalid response from PaySprint" });
    }

    const banks = data.banklist.data; // Array of banks

    await conn.beginTransaction();

    // 3. Insert banks
    let count = 0;
    for (const bank of banks) {
      // bank structure from PaySprint: { id, bankName, iinno, activeFlag, ... }
      // Our table: bank_name, bank_code, ifsc_prefix

      // Map: bankName -> bank_name, iinno -> bank_code
      // ifsc_prefix is not available in this API response, so we set it to NULL
      await conn.query(
        `INSERT INTO banks (bank_name, bank_code, ifsc_prefix) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE bank_name=VALUES(bank_name), bank_code=VALUES(bank_code)`,
        [bank.bankName, bank.iinno, null]
      );
      count++;
    }

    await conn.commit();
    res.json({ message: `Successfully seeded ${count} banks`, total: banks.length });

  } catch (err) {
    await conn.rollback();
    console.error("Seed Banks Error:", err.message);
    res.status(500).json({ message: "Failed to seed banks", error: err.message });
  } finally {
    conn.release();
  }
};


/**
 * Get Banks from PaySprint
 * GET /api/banking/banks
 */
exports.getBanks = async (req, res) => {
  try {
    // 1. Fetch from PaySprint
    const data = await require("../services/paysprint/paysprint.banking").fetchBankList();

    // 2. Validate response structure
    if (!data.banklist || !data.banklist.data) {
      console.error("Invalid PaySprint Response:", JSON.stringify(data));
      return res.status(500).json({ message: "Invalid response from PaySprint" });
    }

    const banks = data.banklist.data;

    // 3. Return formatted list
    const formattedBanks = banks.map(bank => ({
      bank_id: bank.id,
      bank_name: bank.bankName,
      bank_code: bank.iinno,
      active: bank.activeFlag
    }));

    res.json({
      message: "Bank list fetched successfully",
      total: formattedBanks.length,
      banks: formattedBanks
    });

  } catch (err) {
    console.error("Get Banks Error:", err.message);
    res.status(500).json({ message: "Failed to fetch banks", error: err.message });
  }
};
