const pool = require("../config/db");

exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [[user]] = await pool.query(
      "SELECT wallet_balance FROM users WHERE user_id=?",
      [userId]
    );

    res.json({ balance: user.wallet_balance });
  } catch {
    res.status(500).json({ message: "Failed to fetch balance" });
  }
};

exports.addMoney = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    await connection.beginTransaction();

    // Update user balance
    await connection.query(
      "UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?",
      [amount, userId]
    );

    // Record transaction
    const transactionRef = `WADD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    await connection.query(
      "INSERT INTO transactions (user_id, transaction_type, amount, description, status, transaction_reference) VALUES (?, 'Wallet_Credit', ?, 'Money added to wallet', 'Success', ?)",
      [userId, amount, transactionRef]
    );

    await connection.commit();
    res.json({ message: "Money added successfully", transactionRef });
  } catch (error) {
    await connection.rollback();
    console.error("Add money error:", error);
    res.status(500).json({ message: "Failed to add money" });
  } finally {
    connection.release();
  }
};

exports.withdrawMoney = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    await connection.beginTransaction();

    // Check balance
    const [[user]] = await connection.query(
      "SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    if (user.wallet_balance < amount) {
      await connection.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Update balance
    await connection.query(
      "UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?",
      [amount, userId]
    );

    // Record transaction
    const transactionRef = `WWD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    await connection.query(
      "INSERT INTO transactions (user_id, transaction_type, amount, description, status, transaction_reference) VALUES (?, 'Wallet_Debit', ?, 'Money withdrawn from wallet', 'Success', ?)",
      [userId, amount, transactionRef]
    );

    await connection.commit();
    res.json({ message: "Withdrawal successful", transactionRef });
  } catch (error) {
    await connection.rollback();
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Failed to withdraw money" });
  } finally {
    connection.release();
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [transactions] = await pool.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(transactions);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};
