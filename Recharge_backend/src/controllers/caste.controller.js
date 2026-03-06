const CasteModel = require("../models/caste.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Caste Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
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
            pincode
        } = req.body;

        // Basic validation
        if (!full_name || !aadhaar_number || !mobile_number || !category) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "CAS" + Math.random().toString(36).substr(2, 9).toUpperCase();

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
            full_name,
            aadhaar_number,
            mobile_number,
            email,
            dob: formatDateToMySQL(dob),
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
            aadhaar_card_url: getFilePath('aadhaar_card'),
            ration_card_url: getFilePath('ration_card'),
            school_leaving_url: getFilePath('school_leaving'),
            caste_proof_url: getFilePath('caste_proof'),
            father_caste_cert_url: getFilePath('father_caste_cert'),
            self_declaration_url: getFilePath('self_declaration'),
            photo_url: getFilePath('photo')
        };

        const applicationId = await CasteModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Caste Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Caste Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await CasteModel.getAll();
        } else {
            applications = await CasteModel.getByUserId(userId);
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
        const application = await CasteModel.getByReferenceId(referenceId);

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

        await CasteModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};
