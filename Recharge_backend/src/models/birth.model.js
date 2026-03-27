const pool = require("../config/db");

/**
 * Create a new Birth Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        applicant_mobile,
        applicant_aadhaar,
        email,
        child_name,
        gender,
        dob,
        time_of_birth,
        place_of_birth,
        hospital_name,
        registration_date,
        father_name,
        father_aadhaar,
        father_mobile,
        father_occupation,
        father_dob,
        father_marital_status,
        father_place_of_birth,
        father_address,
        mother_name,
        mother_aadhaar,
        mother_mobile,
        mother_occupation,
        mother_dob,
        mother_marital_status,
        mother_place_of_birth,
        mother_address,
        house_no,
        street,
        village,
        taluka,
        district,
        state,
        pincode,
        registration_type,
        delay_reason,
        reference_id,
        hospital_report_url,
        father_aadhaar_card_url,
        mother_aadhaar_card_url,
        address_proof_url,
        marriage_certificate_url,
        affidavit_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO birth_certificates 
        (user_id, applicant_mobile, applicant_aadhaar, email, child_name, gender, dob, time_of_birth, place_of_birth, hospital_name, registration_date, 
        father_name, father_aadhaar, father_mobile, father_occupation, father_dob, father_marital_status, father_place_of_birth, father_address,
        mother_name, mother_aadhaar, mother_mobile, mother_occupation, mother_dob, mother_marital_status, mother_place_of_birth, mother_address, 
        house_no, street, village, taluka, district, state, pincode, registration_type, delay_reason, reference_id,
        hospital_report_url, father_aadhaar_card_url, mother_aadhaar_card_url, address_proof_url, marriage_certificate_url, affidavit_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, applicant_mobile, applicant_aadhaar, email, child_name, gender, dob, time_of_birth, place_of_birth, hospital_name, registration_date,
            father_name, father_aadhaar, father_mobile, father_occupation, father_dob, father_marital_status, father_place_of_birth, father_address,
            mother_name, mother_aadhaar, mother_mobile, mother_occupation, mother_dob, mother_marital_status, mother_place_of_birth, mother_address,
            house_no, street, village, taluka, district, state, pincode, registration_type, delay_reason, reference_id,
            hospital_report_url, father_aadhaar_card_url, mother_aadhaar_card_url, address_proof_url, marriage_certificate_url, affidavit_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT bc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM birth_certificates bc 
         JOIN users u ON bc.user_id = u.user_id 
         ORDER BY bc.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM birth_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT bc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM birth_certificates bc 
         JOIN users u ON bc.user_id = u.user_id 
         WHERE bc.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE birth_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/* --- BIRTH OTP METHODS --- */

exports.storeOTP = async (mobileNumber, otpCode, purpose) => {
    // Delete any existing unverified OTP for this mobile and purpose
    await pool.query(
        "DELETE FROM verification_otps WHERE mobile_number = ? AND purpose = ? AND is_verified = FALSE",
        [mobileNumber, purpose]
    );

    // Store new OTP (expires in 10 mins)
    await pool.query(
        "INSERT INTO verification_otps (mobile_number, otp_code, purpose, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
        [mobileNumber, otpCode, purpose]
    );
};

exports.verifyOTP = async (mobileNumber, otpCode, purpose) => {
    const [rows] = await pool.query(
        "SELECT * FROM verification_otps WHERE mobile_number = ? AND otp_code = ? AND purpose = ? AND is_verified = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
        [mobileNumber, otpCode, purpose]
    );

    if (rows.length > 0) {
        // Mark as verified
        await pool.query("UPDATE verification_otps SET is_verified = TRUE WHERE otp_id = ?", [rows[0].otp_id]);
        return true;
    }
    return false;
};
