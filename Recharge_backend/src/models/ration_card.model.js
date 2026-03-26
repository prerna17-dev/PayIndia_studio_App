const pool = require("../config/db");

/**
 * Create a new Ration Card application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        dob,
        gender,
        house_no,
        street,
        village,
        district,
        state,
        pincode,
        duration_of_stay,
        total_income,
        income_category,
        occupation,
        gas_consumer_no,
        gas_agency_name,
        gas_status
    } = data;

    const [result] = await pool.query(
        `INSERT INTO ration_card_applications 
        (user_id, full_name, aadhaar_number, mobile_number, dob, gender, house_no, street, village, district, state, pincode, duration_of_stay, total_income, income_category, occupation, gas_consumer_no, gas_agency_name, gas_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, dob, gender, house_no, street, village, district, state, pincode, duration_of_stay, total_income, income_category, occupation, gas_consumer_no, gas_agency_name, gas_status
        ]
    );
    return result.insertId;
};

/**
 * Add a member to a Ration Card application
 */
exports.addMember = async (applicationId, member) => {
    const { name, aadhaar, dob, relationship, gender } = member;
    await pool.query(
        `INSERT INTO ration_card_members (application_id, name, aadhaar, dob, relationship, gender) VALUES (?, ?, ?, ?, ?, ?)`,
        [applicationId, name, aadhaar, dob, relationship, gender]
    );
};

/**
 * Add a document to a Ration Card application
 */
exports.addDocument = async (applicationId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO ration_card_documents (application_id, document_type, file_path) VALUES (?, ?, ?)`,
        [applicationId, documentType, filePath]
    );
};

/**
 * Create a new Ration Card correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        ration_card_number,
        head_aadhaar,
        update_types,
        update_details
    } = data;

    const [result] = await pool.query(
        `INSERT INTO ration_card_corrections 
        (user_id, ration_card_number, head_aadhaar, update_types, update_details) 
        VALUES (?, ?, ?, ?, ?)`,
        [user_id, ration_card_number, head_aadhaar, update_types, update_details]
    );
    return result.insertId;
};

/**
 * Add a document to a Ration Card correction request
 */
exports.addCorrectionDocument = async (correctionId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO ration_card_correction_documents (correction_id, document_type, file_path) VALUES (?, ?, ?)`,
        [correctionId, documentType, filePath]
    );
};

/**
 * Get Ration Card applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM ration_card_applications WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get Ration Card application by ID (includes members and documents)
 */
exports.getById = async (applicationId) => {
    const [rows] = await pool.query(
        `SELECT * FROM ration_card_applications WHERE id = ?`,
        [applicationId]
    );

    if (rows.length === 0) return null;

    const application = rows[0];

    const [members] = await pool.query(
        `SELECT * FROM ration_card_members WHERE application_id = ?`,
        [applicationId]
    );
    application.members = members;

    const [documents] = await pool.query(
        `SELECT * FROM ration_card_documents WHERE application_id = ?`,
        [applicationId]
    );
    application.documents = documents;

    return application;
};

/**
 * Update Ration Card application status
 */
exports.updateStatus = async (applicationId, status, remarks) => {
    await pool.query(
        `UPDATE ration_card_applications SET status = ?, remarks = ? WHERE id = ?`,
        [status, remarks, applicationId]
    );
};

/**
 * Create a new Verification OTP
 */
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

/**
 * Verify OTP
 */
exports.verifyOTP = async (mobileNumber, otpCode, purpose) => {
    const [rows] = await pool.query(
        `SELECT * FROM verification_otps 
         WHERE mobile_number = ? AND otp_code = ? AND purpose = ? AND is_verified = FALSE AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1`,
        [mobileNumber, otpCode, purpose]
    );

    if (rows.length > 0) {
        await pool.query(`UPDATE verification_otps SET is_verified = TRUE WHERE otp_id = ?`, [rows[0].otp_id]);
        return true;
    }
    return false;
};
