const pool = require("../config/db");

/**
 * Create a new Domicile Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        email,
        dob,
        gender,
        years_in_state,
        occupation,
        reason,
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
        birth_cert_url,
        school_leaving_url,
        residence_proof_url,
        self_declaration_url,
        photo_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO domicile_certificates 
        (user_id, full_name, aadhaar_number, mobile_number, email, dob, gender, years_in_state, occupation, reason, 
        house_no, street, village, taluka, district, state, pincode, reference_id,
        aadhaar_card_url, ration_card_url, birth_cert_url, school_leaving_url, residence_proof_url, self_declaration_url, photo_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, email, dob, gender, years_in_state, occupation, reason,
            house_no, street, village, taluka, district, state, pincode, reference_id,
            aadhaar_card_url, ration_card_url, birth_cert_url, school_leaving_url, residence_proof_url, self_declaration_url, photo_url
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
         FROM domicile_certificates dc 
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
        `SELECT * FROM domicile_certificates WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM domicile_certificates dc 
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
        `UPDATE domicile_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};
