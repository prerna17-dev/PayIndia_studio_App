const pool = require("../config/db");

/**
 * Create a new Senior Citizen Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        dob,
        gender,
        mobile_number,
        email,
        house_no,
        street,
        village,
        taluka,
        district,
        pincode,
        reference_id,
        aadhaar_card_url,
        age_proof_url,
        address_proof_url,
        photo_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_senior_citizen 
        (user_id, full_name, aadhaar_number, dob, gender, mobile_number, email, house_no, street, 
        village, taluka, district, pincode, reference_id, aadhaar_card_url, age_proof_url, 
        address_proof_url, photo_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, dob, gender, mobile_number, email, house_no, street,
            village, taluka, district, pincode, reference_id, aadhaar_card_url, age_proof_url,
            address_proof_url, photo_url
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
         FROM service_senior_citizen s 
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
        `SELECT * FROM service_senior_citizen WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_senior_citizen s 
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
        `UPDATE service_senior_citizen SET status = ? WHERE id = ?`,
        [status, id]
    );
};
