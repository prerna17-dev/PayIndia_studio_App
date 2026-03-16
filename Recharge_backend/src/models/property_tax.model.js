const pool = require("../config/db");

/**
 * Create a new Property Tax application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        mobile_no_payment,
        property_id,
        district,
        taluka,
        village,
        tax_type,
        amount,
        payment_method,
        reference_id,
        aadhaar_card_url,
        tax_bill_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_property_tax 
        (user_id, full_name, aadhaar_number, mobile_number, mobile_no_payment, property_id, 
        district, taluka, village, tax_type, amount, payment_method, reference_id, 
        aadhaar_card_url, tax_bill_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, mobile_no_payment, property_id,
            district, taluka, village, tax_type, amount, payment_method, reference_id,
            aadhaar_card_url, tax_bill_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT s.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM service_property_tax s 
         JOIN users u ON s.user_id = u.user_id 
         ORDER BY s.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM service_property_tax WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT s.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM service_property_tax s 
         JOIN users u ON s.user_id = u.user_id 
         WHERE s.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE service_property_tax SET status = ? WHERE id = ?`,
        [status, id]
    );
};
