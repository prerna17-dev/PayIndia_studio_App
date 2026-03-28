const pool = require("../config/db");

/**
 * Create a new 8A Extract application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        district,
        taluka,
        village,
        account_number,
        reference_id,
        aadhaar_card_url,
        ownership_proof_url,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_8a_extract 
        (user_id, full_name, aadhaar_number, mobile_number, district, taluka, village, account_number, 
        reference_id, aadhaar_card_url, holding_document_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, district, taluka, village, account_number,
            reference_id, aadhaar_card_url, ownership_proof_url
        ]
    );
    return result.insertId;
};

/**
 * Create a new 8A correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        account_number,
        district,
        taluka,
        village,
        correction_type,
        corrected_name,
        corrected_area,
        corrected_occupant,
        corrected_land_use,
        other_details,
        id_proof_url,
        supporting_doc_url,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_8a_correction 
        (user_id, full_name, aadhaar_number, mobile_number, account_number, district, taluka, village, 
        correction_type, corrected_name, corrected_area, corrected_occupant, corrected_land_use, 
        other_details, id_proof_url, supporting_doc_url, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, account_number, district, taluka, village,
            correction_type, corrected_name, corrected_area, corrected_occupant, corrected_land_use,
            other_details, id_proof_url, supporting_doc_url, reference_id
        ]
    );
    return result.insertId;
};

/**
 * Store OTP for 8A service
 */
exports.storeOTP = async (mobileNumber, otp) => {
    const purpose = "8A_VERIFICATION";
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await pool.query(
        "INSERT INTO verification_otps (mobile_number, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?",
        [mobileNumber, otp, purpose, expiry, otp, expiry]
    );
};

/**
 * Verify OTP for 8A service
 */
exports.verifyOTP = async (mobileNumber, otp) => {
    const [rows] = await pool.query(
        "SELECT * FROM verification_otps WHERE mobile_number = ? AND otp_code = ? AND purpose = '8A_VERIFICATION' AND expires_at > NOW()",
        [mobileNumber, otp]
    );
    return rows.length > 0;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT s.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM service_8a_extract s 
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
        `SELECT * FROM service_8a_extract WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_8a_extract s 
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
        `UPDATE service_8a_extract SET status = ? WHERE id = ?`,
        [status, id]
    );
};
