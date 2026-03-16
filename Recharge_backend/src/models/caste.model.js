const pool = require("../config/db");

/**
 * Create a new Caste Certificate application
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
        category,
        sub_caste,
        religion,
        father_name,
        father_caste,
        mother_name,
        domicile_status,
        house_no,
        street,
        village,
        district,
        pincode,
        reference_id,
        aadhaar_card_url,
        ration_card_url,
        school_leaving_url,
        caste_proof_url,
        father_caste_cert_url,
        self_declaration_url,
        photo_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO caste_certificates 
        (user_id, full_name, aadhaar_number, mobile_number, email, dob, gender, category, sub_caste, religion, 
        father_name, father_caste, mother_name, domicile_status, house_no, street, village, district, pincode, reference_id,
        aadhaar_card_url, ration_card_url, school_leaving_url, caste_proof_url, father_caste_cert_url, self_declaration_url, photo_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, email, dob, gender, category, sub_caste, religion,
            father_name, father_caste, mother_name, domicile_status, house_no, street, village, district, pincode, reference_id,
            aadhaar_card_url, ration_card_url, school_leaving_url, caste_proof_url, father_caste_cert_url, self_declaration_url, photo_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT cc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM caste_certificates cc 
         JOIN users u ON cc.user_id = u.user_id 
         ORDER BY cc.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM caste_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT cc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM caste_certificates cc 
         JOIN users u ON cc.user_id = u.user_id 
         WHERE cc.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE caste_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};
