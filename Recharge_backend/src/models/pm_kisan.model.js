const pool = require("../config/db");

/**
 * Create a new PM Kisan application
 */
exports.create = async (data) => {
    const {
        user_id,
        farmer_name,
        aadhaar_number,
        mobile_number,
        gender,
        category,
        state,
        district,
        taluka,
        village,
        survey_number,
        land_area,
        ownership_type,
        bank_name,
        account_number,
        ifsc_code,
        reference_id,
        land_712_url,
        bank_passbook_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_pm_kisan 
        (user_id, farmer_name, aadhaar_number, mobile_number, gender, category, state, district, taluka, 
        village, survey_number, land_area, ownership_type, bank_name, account_number, ifsc_code, 
        reference_id, land_712_url, bank_passbook_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, farmer_name, aadhaar_number, mobile_number, gender, category, state, district, taluka,
            village, survey_number, land_area, ownership_type, bank_name, account_number, ifsc_code,
            reference_id, land_712_url, bank_passbook_url
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
         FROM service_pm_kisan s 
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
        `SELECT * FROM service_pm_kisan WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_pm_kisan s 
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
        `UPDATE service_pm_kisan SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/**
 * Store OTP for PM Kisan service
 */
exports.storeOTP = async (mobileNumber, otp) => {
    const purpose = "PM_KISAN_VERIFICATION";
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await pool.query(
        "INSERT INTO verification_otps (mobile_number, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?",
        [mobileNumber, otp, purpose, expiry, otp, expiry]
    );
};

/**
 * Verify OTP for PM Kisan service
 */
exports.verifyOTP = async (mobileNumber, otp) => {
    const [rows] = await pool.query(
        "SELECT * FROM verification_otps WHERE mobile_number = ? AND otp_code = ? AND purpose = 'PM_KISAN_VERIFICATION' AND expires_at > NOW()",
        [mobileNumber, otp]
    );
    return rows.length > 0;
};

/**
 * Create a PM Kisan correction application
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        mobile_number,
        aadhaar_number,
        correction_type,
        corrected_name,
        corrected_bank,
        corrected_land,
        other_details,
        id_proof_url,
        supporting_doc_url,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_pm_kisan_correction 
        (user_id, mobile_number, aadhaar_number, correction_type, corrected_name, 
        corrected_bank, corrected_land, other_details, id_proof_url, 
        supporting_doc_url, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, mobile_number, aadhaar_number, correction_type, corrected_name,
            corrected_bank, corrected_land, other_details, id_proof_url,
            supporting_doc_url, reference_id
        ]
    );
    return result.insertId;
};

/**
 * Get application by Aadhaar (check for existing registration)
 */
exports.getByAadhaar = async (aadhaarNumber) => {
    const [rows] = await pool.query(
        `SELECT farmer_name, reference_id, mobile_number, status 
         FROM service_pm_kisan 
         WHERE aadhaar_number = ?`,
        [aadhaarNumber]
    );
    return rows[0];
};

/**
 * Get application by Aadhaar or Reference ID (for status check)
 */
exports.getByAadhaarOrRef = async (idValue, type) => {
    const column = type === "Aadhaar" ? "aadhaar_number" : "reference_id";
    const [rows] = await pool.query(
        `SELECT farmer_name, reference_id, district, status, created_at 
         FROM service_pm_kisan 
         WHERE ${column} = ?`,
        [idValue]
    );
    return rows[0];
};
