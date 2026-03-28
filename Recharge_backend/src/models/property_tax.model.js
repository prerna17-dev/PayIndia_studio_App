const pool = require("../config/db");

/**
 * Create a new Property Tax application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        mobile_no_payment,
        email,
        property_id,
        property_type,
        property_area,
        district,
        taluka,
        village,
        tax_type,
        amount,
        payment_method,
        reference_id,
        aadhaar_card_url,
        tax_bill_url,
        photo_url,
        registration_date,
        application_type,
        index_ii_url,
        posession_letter_url,
        other_doc_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_property_tax 
        (user_id, full_name, aadhaar_number, mobile_number, mobile_no_payment, email, property_id, 
        property_type, property_area, district, taluka, village, tax_type, amount, payment_method, 
        reference_id, aadhaar_card_url, tax_bill_url, photo_url, registration_date, 
        application_type, index_ii_url, posession_letter_url, other_doc_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, mobile_no_payment, email, property_id,
            property_type, property_area, district, taluka, village, tax_type, amount, payment_method,
            reference_id, aadhaar_card_url, tax_bill_url, photo_url, registration_date,
            application_type, index_ii_url, posession_letter_url, other_doc_url
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
         FROM service_property_tax s 
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
        `SELECT * FROM service_property_tax WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_property_tax s 
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
        `UPDATE service_property_tax SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/**
 * Store OTP for Property Tax service
 */
exports.storeOTP = async (mobileNumber, otp) => {
    const purpose = "PROPERTY_TAX_VERIFICATION";
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await pool.query(
        "INSERT INTO verification_otps (mobile_number, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?",
        [mobileNumber, otp, purpose, expiry, otp, expiry]
    );
};

/**
 * Verify OTP for Property Tax service
 */
exports.verifyOTP = async (mobileNumber, otp) => {
    const [rows] = await pool.query(
        "SELECT * FROM verification_otps WHERE mobile_number = ? AND otp_code = ? AND purpose = 'PROPERTY_TAX_VERIFICATION' AND expires_at > NOW()",
        [mobileNumber, otp]
    );
    return rows.length > 0;
};

/**
 * Create a Property Tax correction application
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        property_id,
        aadhaar_number,
        mobile_number,
        correction_type,
        corrected_owner_name,
        corrected_property_area,
        corrected_property_type,
        other_details,
        id_proof_url,
        supporting_doc_url,
        other_doc_url,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_property_tax_correction 
        (user_id, property_id, aadhaar_number, mobile_number, correction_type, 
        corrected_owner_name, corrected_property_area, corrected_property_type, 
        other_details, id_proof_url, supporting_doc_url, other_doc_url, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, property_id, aadhaar_number, mobile_number, correction_type,
            corrected_owner_name, corrected_property_area, corrected_property_type,
            other_details, id_proof_url, supporting_doc_url, other_doc_url, reference_id
        ]
    );
    return result.insertId;
};
