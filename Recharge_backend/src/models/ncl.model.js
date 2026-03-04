const pool = require("../config/db");

/**
 * Create a new Non-Creamy Layer Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        dob,
        gender,
        mobile_number,
        email,
        category,
        sub_caste,
        caste_cert_number,
        issuing_authority,
        issue_date,
        father_name,
        mother_name,
        parent_occupation,
        income_year1,
        income_year2,
        income_year3,
        income_source,
        marital_status,
        caste_before_marriage,
        husband_name,
        marriage_reg_details,
        gazette_name_change,
        is_migrant,
        previous_state,
        previous_district,
        reference_id,
        id_proof_url,
        address_proof_url,
        caste_cert_url,
        income_proof_year1_url,
        income_proof_year2_url,
        income_proof_year3_url,
        photo_url,
        school_leaving_url,
        caste_affidavit_url,
        pre_marriage_caste_url,
        marriage_cert_url,
        gazette_copy_url,
        father_caste_cert_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO non_creamy_layer_certificates 
        (user_id, full_name, aadhaar_number, dob, gender, mobile_number, email, category, sub_caste, caste_cert_number, issuing_authority, issue_date, 
        father_name, mother_name, parent_occupation, income_year1, income_year2, income_year3, income_source, marital_status, 
        caste_before_marriage, husband_name, marriage_reg_details, gazette_name_change, is_migrant, previous_state, previous_district, reference_id,
        id_proof_url, address_proof_url, caste_cert_url, income_proof_year1_url, income_proof_year2_url, income_proof_year3_url, 
        photo_url, school_leaving_url, caste_affidavit_url, pre_marriage_caste_url, marriage_cert_url, gazette_copy_url, father_caste_cert_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, dob, gender, mobile_number, email, category, sub_caste, caste_cert_number, issuing_authority, issue_date,
            father_name, mother_name, parent_occupation, income_year1, income_year2, income_year3, income_source, marital_status,
            caste_before_marriage, husband_name, marriage_reg_details, gazette_name_change, is_migrant, previous_state, previous_district, reference_id,
            id_proof_url, address_proof_url, caste_cert_url, income_proof_year1_url, income_proof_year2_url, income_proof_year3_url,
            photo_url, school_leaving_url, caste_affidavit_url, pre_marriage_caste_url, marriage_cert_url, gazette_copy_url, father_caste_cert_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT ncl.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM non_creamy_layer_certificates ncl 
         JOIN users u ON ncl.user_id = u.user_id 
         ORDER BY ncl.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM non_creamy_layer_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT ncl.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM non_creamy_layer_certificates ncl 
         JOIN users u ON ncl.user_id = u.user_id 
         WHERE ncl.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE non_creamy_layer_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};
