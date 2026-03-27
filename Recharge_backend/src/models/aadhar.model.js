const pool = require("../config/db");

/**
 * Create a new Aadhar enrollment
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        date_of_birth,
        gender,
        house_no_street,
        area_village_locality,
        city_taluka,
        district,
        state,
        pincode,
        mobile_number,
        birth_certificate_url,
        school_certificate_url,
        address_proof_url,
        parent_aadhaar_url,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO aadhar_enrollments 
     (user_id, full_name, date_of_birth, gender, house_no_street, area_village_locality, city_taluka, district, state, pincode, mobile_number, birth_certificate_url, school_certificate_url, address_proof_url, parent_aadhaar_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            full_name,
            date_of_birth,
            gender,
            house_no_street,
            area_village_locality,
            city_taluka,
            district,
            state,
            pincode,
            mobile_number,
            birth_certificate_url,
            school_certificate_url,
            address_proof_url,
            parent_aadhaar_url,
        ]
    );
    return result.insertId;
};

/**
 * Get all enrollments (Admin/Agent view)
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT 
            ae.*, 
            u.name as user_name, u.mobile_number as user_mobile,
            a.name as admin_name,
            ag.name as agent_name
         FROM aadhar_enrollments ae 
         JOIN users u ON ae.user_id = u.user_id 
         LEFT JOIN users a ON ae.admin_id = a.user_id
         LEFT JOIN users ag ON ae.agent_id = ag.user_id
         ORDER BY ae.created_at DESC`
    );
    return rows;
};

/**
 * Get enrollments by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM aadhar_enrollments WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get enrollment by ID
 */
exports.getById = async (enrollmentId) => {
    const [rows] = await pool.query(
        `SELECT 
            ae.*, 
            u.name as user_name, u.mobile_number as user_mobile,
            a.name as admin_name,
            ag.name as agent_name
         FROM aadhar_enrollments ae 
         JOIN users u ON ae.user_id = u.user_id 
         LEFT JOIN users a ON ae.admin_id = a.user_id
         LEFT JOIN users ag ON ae.agent_id = ag.user_id
         WHERE ae.enrollment_id = ?`,
        [enrollmentId]
    );
    return rows[0];
};

/**
 * Update enrollment status (Admin Approval)
 */
exports.updateStatus = async (enrollmentId, adminId, status, remarks) => {
    await pool.query(
        `UPDATE aadhar_enrollments 
     SET status = ?, admin_id = ?, admin_remarks = ? 
     WHERE enrollment_id = ?`,
        [status, adminId, remarks, enrollmentId]
    );
};

/**
 * Process enrollment (Agent Finalization)
 */
exports.processEnrollment = async (enrollmentId, agentId, remarks) => {
    await pool.query(
        `UPDATE aadhar_enrollments 
     SET status = 'Processed', agent_id = ?, agent_remarks = ?, processed_at = NOW() 
     WHERE enrollment_id = ?`,
        [agentId, remarks, enrollmentId]
    );
};

/* --- AADHAAR CORRECTION METHODS --- */

/**
 * Create a new Aadhaar correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        aadhar_number,
        mobile_number,
        corrected_name,
        corrected_dob,
        correction_type,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO aadhar_corrections 
     (user_id, aadhar_number, mobile_number, corrected_name, corrected_dob, correction_type) 
     VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, aadhar_number, mobile_number, corrected_name, corrected_dob, correction_type]
    );
    return result.insertId;
};

/**
 * Add a document to an Aadhaar correction
 */
exports.addCorrectionDocument = async (correctionId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO aadhar_correction_documents (correction_id, document_type, file_path) VALUES (?, ?, ?)`,
        [correctionId, documentType, filePath]
    );
};

/**
 * Get all Aadhaar corrections (Admin/Agent view)
 */
exports.getAllCorrections = async () => {
    const [rows] = await pool.query(
        `SELECT ac.*, u.name as user_name FROM aadhar_corrections ac JOIN users u ON ac.user_id = u.user_id ORDER BY ac.created_at DESC`
    );
    return rows;
};

/**
 * Get correction by ID (includes documents)
 */
exports.getCorrectionById = async (correctionId) => {
    const [rows] = await pool.query(
        `SELECT ac.*, u.name as user_name FROM aadhar_corrections ac JOIN users u ON ac.user_id = u.user_id WHERE ac.correction_id = ?`,
        [correctionId]
    );

    if (rows.length === 0) return null;

    const correction = rows[0];
    const [docs] = await pool.query(`SELECT * FROM aadhar_correction_documents WHERE correction_id = ?`, [correctionId]);
    correction.documents = docs;
    return correction;
};

/**
 * Store OTP for verification
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
