const pool = require("../config/db");

/**
 * Create a new PM Kisan application
 */
exports.create = async (data) => {
    const {
        user_id,
        farmer_name,
        aadhaar_number,
        mobile_number,
        gender,
        category,
        state,
        district,
        taluka,
        village,
        survey_number,
        land_area,
        ownership_type,
        bank_name,
        account_number,
        ifsc_code,
        reference_id,
        land_712_url,
        bank_passbook_url
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_pm_kisan 
        (user_id, farmer_name, aadhaar_number, mobile_number, gender, category, state, district, taluka, 
        village, survey_number, land_area, ownership_type, bank_name, account_number, ifsc_code, 
        reference_id, land_712_url, bank_passbook_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, farmer_name, aadhaar_number, mobile_number, gender, category, state, district, taluka,
            village, survey_number, land_area, ownership_type, bank_name, account_number, ifsc_code,
            reference_id, land_712_url, bank_passbook_url
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
         FROM service_pm_kisan s 
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
        `SELECT * FROM service_pm_kisan WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_pm_kisan s 
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
        `UPDATE service_pm_kisan SET status = ? WHERE id = ?`,
        [status, id]
    );
};
