const pool = require("../config/db");

/**
 * Create a new Voter application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        date_of_birth,
        gender,
        aadhar_number,
        house_no,
        assembly_constituency,
        city,
        district,
        state,
        pincode,
        mobile_number,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO voter_applications 
     (user_id, full_name, date_of_birth, gender, aadhar_number, house_no, assembly_constituency, city, district, state, pincode, mobile_number) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            full_name,
            date_of_birth,
            gender,
            aadhar_number,
            house_no,
            assembly_constituency,
            city,
            district,
            state,
            pincode,
            mobile_number,
        ]
    );
    return result.insertId;
};

/**
 * Add a document to a Voter application
 */
exports.addDocument = async (applicationId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO voter_documents (application_id, document_type, file_path) VALUES (?, ?, ?)`,
        [applicationId, documentType, filePath]
    );
};

/**
 * Get documents for a Voter application
 */
exports.getDocuments = async (applicationId) => {
    const [rows] = await pool.query(
        `SELECT * FROM voter_documents WHERE application_id = ?`,
        [applicationId]
    );
    return rows;
};

/**
 * Get all Voter applications (Admin/Agent view)
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT 
            va.*, 
            u.name as user_name, u.mobile_number as user_mobile,
            a.name as admin_name,
            ag.name as agent_name
         FROM voter_applications va 
         JOIN users u ON va.user_id = u.user_id 
         LEFT JOIN users a ON va.admin_id = a.user_id
         LEFT JOIN users ag ON va.agent_id = ag.user_id
         ORDER BY va.created_at DESC`
    );
    return rows;
};

/**
 * Get Voter applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM voter_applications WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get Voter application by ID (includes documents)
 */
exports.getById = async (applicationId) => {
    const [rows] = await pool.query(
        `SELECT 
            va.*, 
            u.name as user_name, u.mobile_number as user_mobile,
            a.name as admin_name,
            ag.name as agent_name
         FROM voter_applications va 
         JOIN users u ON va.user_id = u.user_id 
         LEFT JOIN users a ON va.admin_id = a.user_id
         LEFT JOIN users ag ON va.agent_id = ag.user_id
         WHERE va.application_id = ?`,
        [applicationId]
    );

    if (rows.length === 0) return null;

    const application = rows[0];
    application.documents = await exports.getDocuments(applicationId);
    return application;
};

/**
 * Update Voter application status (Admin Approval)
 */
exports.updateStatus = async (applicationId, adminId, status, remarks) => {
    await pool.query(
        `UPDATE voter_applications 
     SET status = ?, admin_id = ?, admin_remarks = ? 
     WHERE application_id = ?`,
        [status, adminId, remarks, applicationId]
    );
};

/**
 * Process Voter application (Agent Finalization)
 */
exports.processApplication = async (applicationId, agentId, remarks) => {
    await pool.query(
        `UPDATE voter_applications 
     SET status = 'Processed', agent_id = ?, agent_remarks = ?, processed_at = NOW() 
     WHERE application_id = ?`,
        [agentId, remarks, applicationId]
    );
};

/* --- VOTER CORRECTION METHODS --- */

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
 * Create a Voter correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        voter_id_number,
        aadhar_number,
        mobile_number,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO voter_corrections 
     (user_id, voter_id_number, aadhar_number, mobile_number) 
     VALUES (?, ?, ?, ?)`,
        [user_id, voter_id_number, aadhar_number, mobile_number]
    );
    return result.insertId;
};

/**
 * Add a document to a Voter correction
 */
exports.addCorrectionDocument = async (correctionId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO voter_correction_documents (correction_id, document_type, file_path) VALUES (?, ?, ?)`,
        [correctionId, documentType, filePath]
    );
};

/**
 * Get all Voter corrections
 */
exports.getAllCorrections = async () => {
    const [rows] = await pool.query(
        `SELECT vc.*, u.name as user_name FROM voter_corrections vc JOIN users u ON vc.user_id = u.user_id ORDER BY vc.created_at DESC`
    );
    return rows;
};

/**
 * Get correction by ID (includes documents)
 */
exports.getCorrectionById = async (correctionId) => {
    const [rows] = await pool.query(
        `SELECT vc.*, u.name as user_name FROM voter_corrections vc JOIN users u ON vc.user_id = u.user_id WHERE vc.correction_id = ?`,
        [correctionId]
    );

    if (rows.length === 0) return null;

    const correction = rows[0];
    const [docs] = await pool.query(`SELECT * FROM voter_correction_documents WHERE correction_id = ?`, [correctionId]);
    correction.documents = docs;
    return correction;
};
