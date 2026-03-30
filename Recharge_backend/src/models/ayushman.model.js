const pool = require("../config/db");

/**
 * Create a new Ayushman Bharat application with family members
 */
exports.create = async (data, familyMembers) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const {
            user_id,
            full_name,
            aadhaar_number,
            mobile_number,
            gender,
            dob,
            state,
            district,
            village,
            ration_card_number,
            eligibility_type,
            is_eligible,
            reference_id,
            aadhaar_head_url,
            ration_card_url,
            address_proof_url,
            photo_url,
            secc_proof_url
        } = data;

        const [result] = await connection.query(
            `INSERT INTO service_ayushman_bharat 
            (user_id, full_name, aadhaar_number, mobile_number, gender, dob, state, district, 
            village, ration_card_number, eligibility_type, is_eligible, reference_id, 
            aadhaar_head_url, ration_card_url, address_proof_url, photo_url, secc_proof_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id, full_name, aadhaar_number, mobile_number, gender, dob, state, district,
                village, ration_card_number, eligibility_type, is_eligible, reference_id,
                aadhaar_head_url, ration_card_url, address_proof_url, photo_url, secc_proof_url
            ]
        );

        const applicationId = result.insertId;

        if (familyMembers && familyMembers.length > 0) {
            const memberValues = familyMembers.map(m => [
                applicationId,
                m.name,
                m.aadhaar,
                m.age,
                m.relationship
            ]);

            await connection.query(
                `INSERT INTO ayushman_family_members (application_id, name, aadhaar, age, relationship) VALUES ?`,
                [memberValues]
            );
        }

        await connection.commit();
        return applicationId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Get all applications
 */
exports.getAll = async () => {
    const [rows] = await pool.query(
        `SELECT s.*, u.name as user_name, u.mobile_number as user_mobile 
         FROM service_ayushman_bharat s 
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
        `SELECT * FROM service_ayushman_bharat WHERE user_id = ? ORDER BY created_at DESC`,
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
         FROM service_ayushman_bharat s 
         JOIN users u ON s.user_id = u.user_id 
         WHERE s.reference_id = ?`,
        [referenceId]
    );

    if (rows[0]) {
        const [members] = await pool.query(
            `SELECT * FROM ayushman_family_members WHERE application_id = ?`,
            [rows[0].id]
        );
        rows[0].family_members = members;
    }

    return rows[0];
};

/**
 * Handle OTP for Ayushman Bharat verification
 */
exports.storeOTP = async (mobile, otp, purpose) => {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry
    await pool.query(
        `INSERT INTO verification_otps (mobile_number, otp_code, expires_at, purpose) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?, is_verified = 0`,
        [mobile, otp, expiresAt, purpose, otp, expiresAt]
    );
};

exports.verifyOTP = async (mobile, otp, purpose) => {
    const [rows] = await pool.query(
        `SELECT * FROM verification_otps 
         WHERE mobile_number = ? AND otp_code = ? AND purpose = ? 
         AND expires_at > NOW() AND is_verified = 0`,
        [mobile, otp, purpose]
    );
    if (rows.length > 0) {
        await pool.query(
            `UPDATE verification_otps SET is_verified = 1 WHERE otp_id = ?`,
            [rows[0].otp_id]
        );
        return true;
    }
    return false;
};

/**
 * Get application by Aadhaar (for verification)
 */
exports.getByAadhaar = async (aadhaar) => {
    const [rows] = await pool.query(
        `SELECT * FROM service_ayushman_bharat WHERE aadhaar_number = ? LIMIT 1`,
        [aadhaar]
    );
    return rows[0];
};

/**
 * Create a new Ayushman Bharat correction request
 */
exports.createCorrection = async (data) => {
    const {
        user_id,
        application_id,
        mobile_number,
        aadhaar_number,
        correction_type,
        corrected_name,
        corrected_dob,
        corrected_gender,
        corrected_address,
        corrected_ration_card,
        aadhaar_url,
        ration_card_url,
        address_proof_url,
        photo_url,
        secc_proof_url,
        reference_id
    } = data;

    const [result] = await pool.query(
        `INSERT INTO service_ayushman_bharat_correction 
        (user_id, application_id, mobile_number, aadhaar_number, correction_type, 
        corrected_name, corrected_dob, corrected_gender, corrected_address, 
        corrected_ration_card, aadhaar_url, ration_card_url, address_proof_url, 
        photo_url, secc_proof_url, reference_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id, application_id, mobile_number, aadhaar_number, correction_type,
            corrected_name, corrected_dob, corrected_gender, corrected_address,
            corrected_ration_card, aadhaar_url, ration_card_url, address_proof_url,
            photo_url, secc_proof_url, reference_id
        ]
    );
    return result.insertId;
};
