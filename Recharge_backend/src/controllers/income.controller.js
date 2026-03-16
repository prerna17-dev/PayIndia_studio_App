const IncomeModel = require("../models/income.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Income Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            mobile_number,
            email,
            pan_number,
            dob,
            gender,
            occupation,
            annual_income,
            income_source,
            purpose,
            house_no,
            street,
            village,
            taluka,
            district,
            state,
            pincode
        } = req.body;

        // Basic validation
        if (!full_name || !aadhaar_number || !mobile_number || !annual_income) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "INC" + Math.random().toString(36).substr(2, 9).toUpperCase();

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
            pan_number,
            dob: formatDateToMySQL(dob),
            gender,
            occupation,
            annual_income,
            income_source,
            purpose,
            house_no,
            street,
            village,
            taluka,
            district,
            state,
            pincode,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            ration_card_url: getFilePath('ration_card'),
            tax_receipt_url: getFilePath('tax_receipt'),
            income_proof_url: getFilePath('income_proof'),
            self_declaration_url: getFilePath('self_declaration'),
            photo_url: getFilePath('photo'),
            other_docs_url: getFilePath('other_docs')
        };

        const applicationId = await IncomeModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Income Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Income Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await IncomeModel.getAll();
        } else {
            applications = await IncomeModel.getByUserId(userId);
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
        const application = await IncomeModel.getByReferenceId(referenceId);

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

        await IncomeModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};
