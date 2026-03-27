const pool = require("../config/db");

/**
 * Create a new Marriage Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        groom_name,
        groom_aadhaar,
        groom_dob,
        groom_age,
        groom_occupation,
        groom_mobile,
        groom_email,
        bride_name,
        bride_aadhaar,
        bride_dob,
        bride_age,
        bride_occupation,
        bride_mobile,
        bride_email,
        date_of_marriage,
        place_of_marriage,
        marriage_address,
        type_of_marriage,
        w1_name,
        w1_aadhaar,
        w1_address,
        w1_mobile,
        w2_name,
        w2_aadhaar,
        w2_address,
        w2_mobile,
        reference_id,
        groom_aadhaar_url,
        bride_aadhaar_url,
        invitation_card_url,
        venue_proof_url,
        marriage_photos_url,
        w1_aadhaar_url,
        w2_aadhaar_url,
        w1_photo_url,
        w2_photo_url,
        address_proof_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO marriage_certificates 
        (user_id, groom_name, groom_aadhaar, groom_dob, groom_age, groom_occupation, groom_mobile, groom_email, 
        bride_name, bride_aadhaar, bride_dob, bride_age, bride_occupation, bride_mobile, bride_email, 
        date_of_marriage, place_of_marriage, marriage_address, type_of_marriage, 
        w1_name, w1_aadhaar, w1_address, w1_mobile, w2_name, w2_aadhaar, w2_address, w2_mobile, reference_id,
        groom_aadhaar_url, bride_aadhaar_url, invitation_card_url, venue_proof_url, marriage_photos_url, 
        w1_aadhaar_url, w2_aadhaar_url, w1_photo_url, w2_photo_url, address_proof_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, groom_name, groom_aadhaar, groom_dob, groom_age, groom_occupation, groom_mobile, groom_email,
            bride_name, bride_aadhaar, bride_dob, bride_age, bride_occupation, bride_mobile, bride_email,
            date_of_marriage, place_of_marriage, marriage_address, type_of_marriage,
            w1_name, w1_aadhaar, w1_address, w1_mobile, w2_name, w2_aadhaar, w2_address, w2_mobile, reference_id,
            groom_aadhaar_url, bride_aadhaar_url, invitation_card_url, venue_proof_url, marriage_photos_url,
            w1_aadhaar_url, w2_aadhaar_url, w1_photo_url, w2_photo_url, address_proof_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT mc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM marriage_certificates mc 
         JOIN users u ON mc.user_id = u.user_id 
         ORDER BY mc.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM marriage_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT mc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM marriage_certificates mc 
         JOIN users u ON mc.user_id = u.user_id 
         WHERE mc.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};
 
/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        "UPDATE marriage_certificates SET status = ? WHERE id = ?",
        [status, id]
    );
};

/* --- MARRIAGE OTP METHODS --- */

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
