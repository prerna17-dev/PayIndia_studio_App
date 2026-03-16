const NCLModel = require("../models/ncl.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Non-Creamy Layer Certificate application
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
            previous_district
        } = req.body;

        // Basic validation
        if (!full_name || !aadhaar_number || !income_year1 || !income_year2 || !income_year3) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "NCL" + Math.random().toString(36).substr(2, 9).toUpperCase();

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
            dob: formatDateToMySQL(dob),
            gender,
            mobile_number,
            email,
            category,
            sub_caste,
            caste_cert_number,
            issuing_authority,
            issue_date: formatDateToMySQL(issue_date),
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
            id_proof_url: getFilePath('id_proof'),
            address_proof_url: getFilePath('address_proof'),
            caste_cert_url: getFilePath('caste_cert'),
            income_proof_year1_url: getFilePath('income_proof_year1'),
            income_proof_year2_url: getFilePath('income_proof_year2'),
            income_proof_year3_url: getFilePath('income_proof_year3'),
            photo_url: getFilePath('photo'),
            school_leaving_url: getFilePath('school_leaving'),
            caste_affidavit_url: getFilePath('caste_affidavit'),
            pre_marriage_caste_url: getFilePath('pre_marriage_caste'),
            marriage_cert_url: getFilePath('marriage_cert'),
            gazette_copy_url: getFilePath('gazette_copy'),
            father_caste_cert_url: getFilePath('father_caste_cert')
        };

        const applicationId = await NCLModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Non-Creamy Layer Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get NCL Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await NCLModel.getAll();
        } else {
            applications = await NCLModel.getByUserId(userId);
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
        const application = await NCLModel.getByReferenceId(referenceId);

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

        await NCLModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};
