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
        state,
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
        village, taluka, district, state, pincode, reference_id, aadhaar_card_url, age_proof_url, 
        address_proof_url, photo_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, dob, gender, mobile_number, email, house_no, street,
            village, taluka, district, state, pincode, reference_id, aadhaar_card_url, age_proof_url,
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

/**
 * Handle OTP for senior citizen verification
 */
exports.storeOTP = async (mobile, otp, purpose) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await pool.query(
        `INSERT INTO verification_otps (mobile_number, otp_code, expires_at, purpose) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?, is_verified = 0`,
        [mobile, otp, expiresAt, purpose, otp, expiresAt]
    );
};

exports.verifyOTP = async (mobile, otp, purpose) => {
    const [rows] = await pool.query(
        `SELECT * FROM verification_otps 
         WHERE mobile_number = ? AND otp_code = ? AND purpose = ? 
         AND expires_at > NOW() AND is_verified = 0`,
        [mobile, otp, purpose]
    );
    if (rows.length > 0) {
        await pool.query(
            `UPDATE verification_otps SET is_verified = 1 WHERE otp_id = ?`,
            [rows[0].otp_id]
        );
        return true;
    }
    return false;
};

/**
 * Get application by Aadhaar (for verification)
 */
exports.getByAadhaar = async (aadhaar) => {
    const [rows] = await pool.query(
        `SELECT * FROM service_senior_citizen WHERE aadhaar_number = ? LIMIT 1`,
        [aadhaar]
    );
    return rows[0];
};

/**
 * Create a new Senior Citizen correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        mobile_number,
        aadhaar_number,
        correction_type,
        corrected_name,
        corrected_dob,
        corrected_address,
        corrected_state,
        other_details,
        aadhaar_url,
        age_proof_url,
        address_proof_url,
        photo_url,
        supporting_doc_url,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_senior_citizen_correction 
        (user_id, mobile_number, aadhaar_number, correction_type, corrected_name, 
        corrected_dob, corrected_address, corrected_state, other_details, aadhaar_url, 
        age_proof_url, address_proof_url, photo_url, supporting_doc_url, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, mobile_number, aadhaar_number, correction_type, corrected_name,
            corrected_dob, corrected_address, corrected_state, other_details, aadhaar_url,
            age_proof_url, address_proof_url, photo_url, supporting_doc_url, reference_id
        ]
    );
    return result.insertId;
};
