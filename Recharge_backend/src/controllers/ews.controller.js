const EWSModel = require("../models/ews.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new EWS Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            dob,
            gender,
            mobile_number,
            email,
            category,
            father_name,
            mother_name,
            spouse_name,
            family_members_count,
            family_occupation,
            income_salary,
            income_agri,
            income_business,
            income_other,
            total_annual_income,
            flat_size,
            plot_size,
            location_type,
            agri_land_details,
            ownership_status
        } = req.body;

        // Basic validation
        if (!full_name || !aadhaar_number || !total_annual_income) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "EWS" + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Map uploaded files
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0]) 
                ? normalizePath(files[fieldName][0].path) 
                : null;
        };

        // Multi-file fields
        const proofOfIncomeUrls = files['proof_of_income'] ? JSON.stringify(files['proof_of_income'].map(f => normalizePath(f.path))) : null;
        const propertyDocsUrls = files['property_docs'] ? JSON.stringify(files['property_docs'].map(f => normalizePath(f.path))) : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            dob: formatDateToMySQL(dob),
            gender,
            mobile_number,
            email,
            category,
            father_name,
            mother_name,
            spouse_name,
            family_members_count,
            family_occupation,
            income_salary,
            income_agri,
            income_business,
            income_other,
            total_annual_income,
            flat_size,
            plot_size,
            location_type,
            agri_land_details,
            ownership_status,
            reference_id,
            income_cert_url: getFilePath('income_cert'),
            proof_of_income_urls: proofOfIncomeUrls,
            property_docs_urls: propertyDocsUrls,
            id_proof_url: getFilePath('id_proof'),
            residence_proof_url: getFilePath('residence_proof'),
            self_declaration_url: getFilePath('self_declaration'),
            photo_url: getFilePath('photo'),
            caste_cert_url: getFilePath('caste_cert')
        };

        const applicationId = await EWSModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "EWS Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get EWS Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await EWSModel.getAll();
        } else {
            applications = await EWSModel.getByUserId(userId);
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
        const application = await EWSModel.getByReferenceId(referenceId);

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

        await EWSModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};
