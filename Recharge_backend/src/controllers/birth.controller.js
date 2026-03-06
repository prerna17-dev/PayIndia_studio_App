const BirthModel = require("../models/birth.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Birth Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
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
            delay_reason
        } = req.body;

        // Basic validation
        if (!child_name || !dob || !place_of_birth) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "BIR" + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Map uploaded files
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0]) 
                ? normalizePath(files[fieldName][0].path) 
                : null;
        };

        const applicationData = {
            user_id: userId,
            child_name,
            gender,
            dob: formatDateToMySQL(dob),
            time_of_birth,
            place_of_birth,
            hospital_name,
            registration_date: formatDateToMySQL(registration_date),
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
            hospital_report_url: getFilePath('hospital_report'),
            parents_aadhaar_url: getFilePath('parents_aadhaar'),
            address_proof_url: getFilePath('address_proof'),
            marriage_certificate_url: getFilePath('marriage_certificate'),
            affidavit_url: getFilePath('affidavit')
        };

        const applicationId = await BirthModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Birth Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Birth Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await BirthModel.getAll();
        } else {
            applications = await BirthModel.getByUserId(userId);
        }

        res.json({
            success: true,
            data: applications,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get single application by Reference ID
 */
exports.getApplicationByRef = async (req, res, next) => {
    try {
        const { referenceId } = req.params;
        const application = await BirthModel.getByReferenceId(referenceId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // Authorization
        if (req.user.role === "USER" && application.user_id !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }

        res.json({
            success: true,
            data: application,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update application status
 */
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (req.user.role !== "ADMIN" && req.user.role !== "AGENT") {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }

        await BirthModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};
