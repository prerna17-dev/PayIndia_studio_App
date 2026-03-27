const pool = require("../config/db");

/**
 * Create a new EWS Certificate application
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
        category,
        father_name,
        mother_name,
        spouse_name,
        family_members_count,
        family_occupation,
        income_salary,
        income_agri,
        income_business,
        income_other,
        total_annual_income,
        flat_size,
        plot_size,
        location_type,
        agri_land_details,
        ownership_status,
        reference_id,
        income_cert_url,
        proof_of_income_urls,
        property_docs_urls,
        id_proof_url,
        residence_proof_url,
        self_declaration_url,
        photo_url,
        caste_cert_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO ews_certificates 
        (user_id, full_name, aadhaar_number, dob, gender, mobile_number, email, category, father_name, mother_name, spouse_name, 
        family_members_count, family_occupation, income_salary, income_agri, income_business, income_other, total_annual_income, 
        flat_size, plot_size, location_type, agri_land_details, ownership_status, reference_id,
        income_cert_url, proof_of_income_urls, property_docs_urls, id_proof_url, residence_proof_url, self_declaration_url, photo_url, caste_cert_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, dob, gender, mobile_number, email, category, father_name, mother_name, spouse_name,
            family_members_count, family_occupation, income_salary, income_agri, income_business, income_other, total_annual_income,
            flat_size, plot_size, location_type, agri_land_details, ownership_status, reference_id,
            income_cert_url, proof_of_income_urls, property_docs_urls, id_proof_url, residence_proof_url, self_declaration_url, photo_url, caste_cert_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT ec.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM ews_certificates ec 
         JOIN users u ON ec.user_id = u.user_id 
         ORDER BY ec.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM ews_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT ec.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM ews_certificates ec 
         JOIN users u ON ec.user_id = u.user_id 
         WHERE ec.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE ews_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/* --- EWS OTP METHODS --- */

exports.storeOTP = async (mobile, otp, purpose) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await pool.query(
        `INSERT INTO verification_otps (mobile_number, otp_code, purpose, expires_at) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?, is_verified = 0`,
        [mobile, otp, purpose, expiresAt, otp, expiresAt]
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
