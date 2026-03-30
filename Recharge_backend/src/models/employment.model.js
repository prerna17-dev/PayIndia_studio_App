const pool = require("../config/db");

/**
 * Create a new Employment Registration application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        dob,
        gender,
        category,
        mobile_number,
        email,
        house_no,
        area,
        village,
        taluka,
        district,
        pincode,
        employment_status,
        experience_years,
        qualification,
        computer_skills,
        languages,
        pref_sector,
        reference_id,
        aadhaar_card_url,
        education_cert_url,
        photo_url,
        experience_cert_url,
        caste_cert_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_employment_registration 
        (user_id, full_name, aadhaar_number, dob, gender, category, mobile_number, email, 
        house_no, area, village, taluka, district, pincode, employment_status, experience_years, 
        qualification, computer_skills, languages, pref_sector, reference_id, aadhaar_card_url, 
        education_cert_url, photo_url, experience_cert_url, caste_cert_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, dob, gender, category, mobile_number, email,
            house_no, area, village, taluka, district, pincode, employment_status, experience_years,
            qualification, computer_skills, languages, pref_sector, reference_id, aadhaar_card_url,
            education_cert_url, photo_url, experience_cert_url, caste_cert_url
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
         FROM service_employment_registration s 
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
        `SELECT * FROM service_employment_registration WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_employment_registration s 
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
        `UPDATE service_employment_registration SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/**
 * Handle OTP for employment verification
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
        `SELECT * FROM service_employment_registration WHERE aadhaar_number = ? LIMIT 1`,
        [aadhaar]
    );
    return rows[0];
};

/**
 * Create a new Employment correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        registration_id,
        mobile_number,
        aadhaar_number,
        correction_type,
        corrected_name,
        corrected_dob,
        corrected_address,
        corrected_qualification,
        corrected_experience,
        corrected_skills,
        other_details,
        aadhaar_url,
        education_cert_url,
        experience_cert_url,
        photo_url,
        supporting_doc_url,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_employment_registration_correction 
        (user_id, registration_id, mobile_number, aadhaar_number, correction_type, corrected_name, 
        corrected_dob, corrected_address, corrected_qualification, corrected_experience, 
        corrected_skills, other_details, aadhaar_url, education_cert_url, experience_cert_url, 
        photo_url, supporting_doc_url, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, registration_id, mobile_number, aadhaar_number, correction_type, corrected_name,
            corrected_dob, corrected_address, corrected_qualification, corrected_experience,
            corrected_skills, other_details, aadhaar_url, education_cert_url, experience_cert_url,
            photo_url, supporting_doc_url, reference_id
        ]
    );
    return result.insertId;
};
