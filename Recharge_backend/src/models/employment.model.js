const pool = require("../config/db");

/**
 * Create a new Employment Registration application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        dob,
        gender,
        category,
        mobile_number,
        email,
        house_no,
        area,
        village,
        taluka,
        district,
        pincode,
        employment_status,
        experience_years,
        qualification,
        computer_skills,
        languages,
        pref_sector,
        reference_id,
        aadhaar_card_url,
        education_cert_url,
        photo_url,
        experience_cert_url,
        caste_cert_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_employment_registration 
        (user_id, full_name, aadhaar_number, dob, gender, category, mobile_number, email, 
        house_no, area, village, taluka, district, pincode, employment_status, experience_years, 
        qualification, computer_skills, languages, pref_sector, reference_id, aadhaar_card_url, 
        education_cert_url, photo_url, experience_cert_url, caste_cert_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, dob, gender, category, mobile_number, email,
            house_no, area, village, taluka, district, pincode, employment_status, experience_years,
            qualification, computer_skills, languages, pref_sector, reference_id, aadhaar_card_url,
            education_cert_url, photo_url, experience_cert_url, caste_cert_url
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
         FROM service_employment_registration s 
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
        `SELECT * FROM service_employment_registration WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_employment_registration s 
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
        `UPDATE service_employment_registration SET status = ? WHERE id = ?`,
        [status, id]
    );
};
