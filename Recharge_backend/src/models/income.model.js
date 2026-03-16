const pool = require("../config/db");

/**
 * Create a new Income Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        email,
        pan_number,
        dob,
        gender,
        occupation,
        annual_income,
        income_source,
        purpose,
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
        tax_receipt_url,
        income_proof_url,
        self_declaration_url,
        photo_url,
        other_docs_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO income_certificates 
        (user_id, full_name, aadhaar_number, mobile_number, email, pan_number, dob, gender, occupation, annual_income, 
        income_source, purpose, house_no, street, village, taluka, district, state, pincode, reference_id,
        aadhaar_card_url, ration_card_url, tax_receipt_url, income_proof_url, self_declaration_url, photo_url, other_docs_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, email, pan_number, dob, gender, occupation, annual_income,
            income_source, purpose, house_no, street, village, taluka, district, state, pincode, reference_id,
            aadhaar_card_url, ration_card_url, tax_receipt_url, income_proof_url, self_declaration_url, photo_url, other_docs_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT ic.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM income_certificates ic 
         JOIN users u ON ic.user_id = u.user_id 
         ORDER BY ic.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM income_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT ic.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM income_certificates ic 
         JOIN users u ON ic.user_id = u.user_id 
         WHERE ic.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE income_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};
