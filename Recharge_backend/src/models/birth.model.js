const pool = require("../config/db");

/**
 * Create a new Birth Certificate application
 */
exports.create = async (data) => {
    const {
        user_id,
        child_name,
        gender,
        dob,
        time_of_birth,
        place_of_birth,
        hospital_name,
        registration_date,
        father_name,
        father_aadhaar,
        father_mobile,
        father_occupation,
        mother_name,
        mother_aadhaar,
        mother_mobile,
        mother_occupation,
        house_no,
        street,
        village,
        district,
        state,
        pincode,
        registration_type,
        delay_reason,
        reference_id,
        hospital_report_url,
        parents_aadhaar_url,
        address_proof_url,
        marriage_certificate_url,
        affidavit_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO birth_certificates 
        (user_id, child_name, gender, dob, time_of_birth, place_of_birth, hospital_name, registration_date, 
        father_name, father_aadhaar, father_mobile, father_occupation, mother_name, mother_aadhaar, mother_mobile, mother_occupation, 
        house_no, street, village, district, state, pincode, registration_type, delay_reason, reference_id,
        hospital_report_url, parents_aadhaar_url, address_proof_url, marriage_certificate_url, affidavit_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, child_name, gender, dob, time_of_birth, place_of_birth, hospital_name, registration_date,
            father_name, father_aadhaar, father_mobile, father_occupation, mother_name, mother_aadhaar, mother_mobile, mother_occupation,
            house_no, street, village, district, state, pincode, registration_type, delay_reason, reference_id,
            hospital_report_url, parents_aadhaar_url, address_proof_url, marriage_certificate_url, affidavit_url
        ]
    );
    return result.insertId;
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT bc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM birth_certificates bc 
         JOIN users u ON bc.user_id = u.user_id 
         ORDER BY bc.created_at DESC`
    );
    return rows;
};

/**
 * Get applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM birth_certificates WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get application by Reference ID
 */
exports.getByReferenceId = async (referenceId) => {
    const [rows] = await pool.query(
        `SELECT bc.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM birth_certificates bc 
         JOIN users u ON bc.user_id = u.user_id 
         WHERE bc.reference_id = ?`,
        [referenceId]
    );
    return rows[0];
};

/**
 * Update application status
 */
exports.updateStatus = async (id, status) => {
    await pool.query(
        `UPDATE birth_certificates SET status = ? WHERE id = ?`,
        [status, id]
    );
};
