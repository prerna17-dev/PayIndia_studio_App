const pool = require("../config/db");

/**
 * Create a new Death Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        deceased_name,
        deceased_aadhaar,
        gender,
        dob,
        date_of_death,
        time_of_death,
        place_of_death,
        hospital_name,
        cause_of_death,
        applicant_name,
        applicant_aadhaar,
        relationship,
        mobile_number,
        email,
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
        death_report_url,
        deceased_aadhaar_url,
        applicant_aadhaar_url,
        address_proof_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO death_certificates 
        (user_id, deceased_name, deceased_aadhaar, gender, dob, date_of_death, time_of_death, place_of_death, hospital_name, cause_of_death, 
        applicant_name, applicant_aadhaar, relationship, mobile_number, email, house_no, street, village, taluka, district, state, pincode, 
        registration_type, delay_reason, reference_id, death_report_url, deceased_aadhaar_url, applicant_aadhaar_url, address_proof_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, deceased_name, deceased_aadhaar, gender, dob, date_of_death, time_of_death, place_of_death, hospital_name, cause_of_death,
            applicant_name, applicant_aadhaar, relationship, mobile_number, email, house_no, street, village, taluka, district, state, pincode,
            registration_type, delay_reason, reference_id, death_report_url, deceased_aadhaar_url, applicant_aadhaar_url, address_proof_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT dc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM death_certificates dc 
         JOIN users u ON dc.user_id = u.user_id 
         ORDER BY dc.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM death_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT dc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM death_certificates dc 
         JOIN users u ON dc.user_id = u.user_id 
         WHERE dc.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE death_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/* --- DEATH OTP METHODS --- */

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
