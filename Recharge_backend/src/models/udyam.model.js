const pool = require("../config/db");

/**
 * Create a new Udyam Registration application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        pan_number,
        mobile_number,
        email,
        organization_type,
        gender,
        category,
        disability,
        unit_name,
        location,
        office_address,
        bank_name,
        ifsc,
        account_number,
        business_activity,
        employees_count,
        investment,
        turnover,
        registration_date,
        reference_id,
        aadhaar_card_url,
        pan_card_url,
        bank_passbook_url,
        photo_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_udyam_registration 
        (user_id, full_name, aadhaar_number, pan_number, mobile_number, email, organization_type, 
        gender, category, disability, unit_name, location, office_address, bank_name, ifsc, 
        account_number, business_activity, employees_count, investment, turnover, registration_date, 
        reference_id, aadhaar_card_url, pan_card_url, bank_passbook_url, photo_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, pan_number, mobile_number, email, organization_type,
            gender, category, disability, unit_name, location, office_address, bank_name, ifsc,
            account_number, business_activity, employees_count, investment, turnover, registration_date,
            reference_id, aadhaar_card_url, pan_card_url, bank_passbook_url, photo_url
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
         FROM service_udyam_registration s 
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
        `SELECT * FROM service_udyam_registration WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_udyam_registration s 
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
        `UPDATE service_udyam_registration SET status = ? WHERE id = ?`,
        [status, id]
    );
};

/* --- UDYAM CORRECTION METHODS --- */

/**
 * Create a new Udyam correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        udyam_number,
        aadhaar_number,
        update_type,
        new_value,
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_udyam_correction 
        (user_id, udyam_number, aadhaar_number, update_type, new_value) 
        VALUES (?, ?, ?, ?, ?)`,
        [user_id, udyam_number, aadhaar_number, update_type, new_value]
    );
    return result.insertId;
};

/**
 * Add a document to a Udyam correction
 */
exports.addCorrectionDocument = async (correctionId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO service_udyam_correction_documents (correction_id, document_type, file_path) VALUES (?, ?, ?)`,
        [correctionId, documentType, filePath]
    );
};

/**
 * Get all Udyam corrections
 */
exports.getAllCorrections = async () => {
    const [rows] = await pool.query(
        `SELECT uc.*, u.name as user_name FROM service_udyam_correction uc JOIN users u ON uc.user_id = u.user_id ORDER BY uc.created_at DESC`
    );
    return rows;
};
