const pool = require("../config/db");

// Upload KYC Document (Generic for Aadhaar or PAN)
exports.uploadKYCDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { document_type, document_number } = req.body;

    if (!document_type || !document_number) {
      return res.status(400).json({ message: "Document type and number are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No document image uploaded" });
    }

    // Path where multer saved the file
    const file_path = `/uploads/kyc/${req.file.filename}`;

    // Upsert logic to handle re-uploads
    const [existing] = await pool.query(
      `SELECT kyc_id FROM user_kyc WHERE user_id = ? AND document_type = ?`,
      [userId, document_type]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE user_kyc 
         SET document_number = ?, document_image_url = ?, status = 'Pending', admin_remarks = NULL 
         WHERE user_id = ? AND document_type = ?`,
        [document_number, file_path, userId, document_type]
      );
    } else {
      await pool.query(
        `INSERT INTO user_kyc (user_id, document_type, document_number, document_image_url, status) 
         VALUES (?, ?, ?, ?, 'Pending')`,
        [userId, document_type, document_number, file_path]
      );
    }

    res.json({ success: true, message: `${document_type} uploaded successfully and is pending verification.` });
  } catch (err) {
    console.error("Upload KYC Error:", err);
    res.status(500).json({ success: false, message: "Failed to upload KYC document" });
  }
};

// Fetch KYC Status for a specific document type
exports.getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { document_type } = req.params;

    const [rows] = await pool.query(
      `SELECT document_type, document_number, document_image_url, status, admin_remarks, updated_at 
       FROM user_kyc WHERE user_id = ? AND document_type = ?`,
      [userId, document_type]
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Get KYC Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch KYC status" });
  }
};

// Fetch All KYC Documents Status
exports.getAllKYCStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [rows] = await pool.query(
      `SELECT document_type, status, admin_remarks, updated_at 
       FROM user_kyc WHERE user_id = ?`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Get All KYC Status Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch all KYC statuses" });
  }
};
