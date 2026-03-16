const pool = require("../config/db");

/**
 * Create a new Ration Card application
 */
exports.create = async (data) => {
    const {
        user_id,
        full_name,
        aadhaar_number,
        mobile_number,
        dob,
        gender,
        house_no,
        street,
        village,
        district,
        state,
        pincode,
        duration_of_stay,
        total_income,
        income_category,
        occupation,
        gas_consumer_no,
        gas_agency_name,
        gas_status
    } = data;

    const [result] = await pool.query(
        `INSERT INTO ration_card_applications 
        (user_id, full_name, aadhaar_number, mobile_number, dob, gender, house_no, street, village, district, state, pincode, duration_of_stay, total_income, income_category, occupation, gas_consumer_no, gas_agency_name, gas_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, full_name, aadhaar_number, mobile_number, dob, gender, house_no, street, village, district, state, pincode, duration_of_stay, total_income, income_category, occupation, gas_consumer_no, gas_agency_name, gas_status
        ]
    );
    return result.insertId;
};

/**
 * Add a member to a Ration Card application
 */
exports.addMember = async (applicationId, member) => {
    const { name, aadhaar, dob, relationship, gender } = member;
    await pool.query(
        `INSERT INTO ration_card_members (application_id, name, aadhaar, dob, relationship, gender) VALUES (?, ?, ?, ?, ?, ?)`,
        [applicationId, name, aadhaar, dob, relationship, gender]
    );
};

/**
 * Add a document to a Ration Card application
 */
exports.addDocument = async (applicationId, documentType, filePath) => {
    await pool.query(
        `INSERT INTO ration_card_documents (application_id, document_type, file_path) VALUES (?, ?, ?)`,
        [applicationId, documentType, filePath]
    );
};

/**
 * Get Ration Card applications by user ID
 */
exports.getByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM ration_card_applications WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

/**
 * Get Ration Card application by ID (includes members and documents)
 */
exports.getById = async (applicationId) => {
    const [rows] = await pool.query(
        `SELECT * FROM ration_card_applications WHERE id = ?`,
        [applicationId]
    );

    if (rows.length === 0) return null;

    const application = rows[0];

    const [members] = await pool.query(
        `SELECT * FROM ration_card_members WHERE application_id = ?`,
        [applicationId]
    );
    application.members = members;

    const [documents] = await pool.query(
        `SELECT * FROM ration_card_documents WHERE application_id = ?`,
        [applicationId]
    );
    application.documents = documents;

    return application;
};

/**
 * Update Ration Card application status
 */
exports.updateStatus = async (applicationId, status, remarks) => {
    await pool.query(
        `UPDATE ration_card_applications SET status = ?, remarks = ? WHERE id = ?`,
        [status, remarks, applicationId]
    );
};
