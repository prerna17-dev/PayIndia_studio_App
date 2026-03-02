const pool = require("../config/db");

/**
 * Create a new PAN application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        father_name,
        mother_name,
        date_of_birth,
        mobile_number,
        email_address,
        aadhar_number,
        full_address,
        city,
        district,
        state,
        pincode,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO pan_applications 
     (user_id, full_name, father_name, mother_name, date_of_birth, mobile_number, email_address, aadhar_number, full_address, city, district, state, pincode) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            full_name,
            father_name,
            mother_name,
            date_of_birth,
            mobile_number,
            email_address,
            aadhar_number,
            full_address,
            city,
            district,
            state,
            pincode,
        ]
    );
    return result.insertId;
};

/**
 * Add a document to a PAN application
 */
exports.addDocument = async (applicationId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO pan_documents (application_id, document_type, file_path) VALUES (?, ?, ?)`,
        [applicationId, documentType, filePath]
    );
};

/**
 * Get documents for a PAN application
 */
exports.getDocuments = async (applicationId) => {
    const [rows] = await pool.query(
        `SELECT * FROM pan_documents WHERE application_id = ?`,
        [applicationId]
    );
    return rows;
};

/**
 * Get all PAN applications (Admin/Agent view)
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT 
            pa.*, 
            u.name as user_name, u.mobile_number as user_mobile,
            a.name as admin_name,
            ag.name as agent_name
         FROM pan_applications pa 
         JOIN users u ON pa.user_id = u.user_id 
         LEFT JOIN users a ON pa.admin_id = a.user_id
         LEFT JOIN users ag ON pa.agent_id = ag.user_id
         ORDER BY pa.created_at DESC`
    );
    return rows;
};

/**
 * Get PAN applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM pan_applications WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get PAN application by ID (includes documents)
 */
exports.getById = async (applicationId) => {
    const [rows] = await pool.query(
        `SELECT 
            pa.*, 
            u.name as user_name, u.mobile_number as user_mobile,
            a.name as admin_name,
            ag.name as agent_name
         FROM pan_applications pa 
         JOIN users u ON pa.user_id = u.user_id 
         LEFT JOIN users a ON pa.admin_id = a.user_id
         LEFT JOIN users ag ON pa.agent_id = ag.user_id
         WHERE pa.application_id = ?`,
        [applicationId]
    );

    if (rows.length === 0) return null;

    const application = rows[0];
    application.documents = await exports.getDocuments(applicationId);
    return application;
};

/**
 * Update PAN application status (Admin Approval)
 */
exports.updateStatus = async (applicationId, adminId, status, remarks) => {
    await pool.query(
        `UPDATE pan_applications 
     SET status = ?, admin_id = ?, admin_remarks = ? 
     WHERE application_id = ?`,
        [status, adminId, remarks, applicationId]
    );
};

/**
 * Process PAN application (Agent Finalization)
 */
exports.processApplication = async (applicationId, agentId, remarks) => {
    await pool.query(
        `UPDATE pan_applications 
     SET status = 'Processed', agent_id = ?, agent_remarks = ?, processed_at = NOW() 
     WHERE application_id = ?`,
        [agentId, remarks, applicationId]
    );
};

/* --- PAN CORRECTION METHODS --- */

/**
 * Create a new Verification OTP
 */
exports.storeOTP = async (mobileNumber, otpCode, purpose) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await pool.query(
        `INSERT INTO verification_otps (mobile_number, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)`,
        [mobileNumber, otpCode, purpose, expiresAt]
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

/**
 * Create a PAN correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        pan_number,
        mobile_number,
        corrected_name,
        corrected_dob,
        correction_type,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO pan_corrections 
     (user_id, pan_number, mobile_number, corrected_name, corrected_dob, correction_type) 
     VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, pan_number, mobile_number, corrected_name, corrected_dob, correction_type]
    );
    return result.insertId;
};

/**
 * Add a document to a PAN correction
 */
exports.addCorrectionDocument = async (correctionId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO pan_correction_documents (correction_id, document_type, file_path) VALUES (?, ?, ?)`,
        [correctionId, documentType, filePath]
    );
};

/**
 * Get all PAN corrections
 */
exports.getAllCorrections = async () => {
    const [rows] = await pool.query(
        `SELECT pc.*, u.name as user_name FROM pan_corrections pc JOIN users u ON pc.user_id = u.user_id ORDER BY pc.created_at DESC`
    );
    return rows;
};

/**
 * Get correction by ID (includes documents)
 */
exports.getCorrectionById = async (correctionId) => {
    const [rows] = await pool.query(
        `SELECT pc.*, u.name as user_name FROM pan_corrections pc JOIN users u ON pc.user_id = u.user_id WHERE pc.correction_id = ?`,
        [correctionId]
    );

    if (rows.length === 0) return null;

    const correction = rows[0];
    const [docs] = await pool.query(`SELECT * FROM pan_correction_documents WHERE correction_id = ?`, [correctionId]);
    correction.documents = docs;
    return correction;
};
