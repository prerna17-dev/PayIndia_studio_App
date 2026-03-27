const pool = require("../config/db");

/**
 * Create a new Income Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        email,
        father_name,
        mother_name,
        spouse_name,
        family_members_count,
        pan_number,
        dob,
        gender,
        occupation,
        annual_income,
        monthly_income,
        income_source,
        employer_name,
        purpose,
        required_for,
        house_no,
        street,
        village,
        taluka,
        district,
        state,
        pincode,
        reference_id,
        aadhaar_card_url,
        ration_card_url,
        address_proof_url,
        income_proof_url,
        self_declaration_url,
        passport_photo_url,
        other_docs_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO income_certificates 
        (user_id, full_name, aadhaar_number, mobile_number, email, father_name, mother_name, spouse_name, family_members_count, pan_number, dob, gender, occupation, annual_income, monthly_income,
        income_source, employer_name, purpose, required_for, house_no, street, village, taluka, district, state, pincode, reference_id,
        aadhaar_card_url, ration_card_url, address_proof_url, income_proof_url, self_declaration_url, passport_photo_url, other_docs_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, email, father_name, mother_name, spouse_name, family_members_count, pan_number, dob, gender, occupation, annual_income, monthly_income,
            income_source, employer_name, purpose, required_for, house_no, street, village, taluka, district, state, pincode, reference_id,
            aadhaar_card_url, ration_card_url, address_proof_url, income_proof_url, self_declaration_url, passport_photo_url, other_docs_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT ic.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM income_certificates ic 
         JOIN users u ON ic.user_id = u.user_id 
         ORDER BY ic.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM income_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT ic.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM income_certificates ic 
         JOIN users u ON ic.user_id = u.user_id 
         WHERE ic.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE income_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/* --- INCOME OTP METHODS --- */

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
