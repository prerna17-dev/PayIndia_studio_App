const pool = require("../config/db");

/**
 * Create a new Ferfar application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        khata_number,
        district,
        taluka,
        village,
        survey_number,
        mutation_type,
        other_reason,
        reference_id,
        id_proof_url,
        aadhaar_card_url,
        mutation_record_url,
        ownership_doc_url,
        application_form_url,
        prev_8a_url,
        legal_doc_url,
        photo_url,
        other_doc_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_ferfar_application 
        (user_id, full_name, aadhaar_number, mobile_number, khata_number, district, taluka, village, survey_number, 
        mutation_type, other_reason, reference_id, id_proof_url, aadhaar_card_url, mutation_record_url, 
        ownership_doc_url, application_form_url, prev_8a_url, legal_doc_url, photo_url, other_doc_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, khata_number, district, taluka, village, survey_number,
            mutation_type, other_reason, reference_id, id_proof_url, aadhaar_card_url, mutation_record_url, 
            ownership_doc_url, application_form_url, prev_8a_url, legal_doc_url, photo_url, other_doc_url
        ]
    );
    return result.insertId;
};

/**
 * Store OTP for Ferfar service
 */
exports.storeOTP = async (mobileNumber, otp) => {
    const purpose = "FERFAR_VERIFICATION";
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await pool.query(
        "INSERT INTO verification_otps (mobile_number, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?",
        [mobileNumber, otp, purpose, expiry, otp, expiry]
    );
};

/**
 * Verify OTP for Ferfar service
 */
exports.verifyOTP = async (mobileNumber, otp) => {
    const [rows] = await pool.query(
        "SELECT * FROM verification_otps WHERE mobile_number = ? AND otp_code = ? AND purpose = 'FERFAR_VERIFICATION' AND expires_at > NOW()",
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
         FROM service_ferfar_application s 
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
        `SELECT * FROM service_ferfar_application WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_ferfar_application s 
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
        `UPDATE service_ferfar_application SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/**
 * Create a Ferfar correction application
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        ferfar_number,
        aadhaar_number,
        mobile_number,
        correction_type,
        corrected_applicant_name,
        corrected_mutation_year,
        corrected_mutation_reason,
        other_details,
        id_proof_url,
        supporting_doc_url,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_ferfar_correction 
        (user_id, ferfar_number, aadhaar_number, mobile_number, correction_type, 
        corrected_applicant_name, corrected_mutation_year, corrected_mutation_reason, 
        other_details, id_proof_url, supporting_doc_url, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, ferfar_number, aadhaar_number, mobile_number, correction_type,
            corrected_applicant_name, corrected_mutation_year, corrected_mutation_reason,
            other_details, id_proof_url, supporting_doc_url, reference_id
        ]
    );
    return result.insertId;
};
