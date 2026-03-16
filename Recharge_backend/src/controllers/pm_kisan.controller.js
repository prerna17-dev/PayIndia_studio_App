const PMKisanModel = require("../models/pm_kisan.model");

/**
 * Submit a new PM Kisan application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
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
            ifsc_code
        } = req.body;

        if (!farmer_name || !aadhaar_number || !mobile_number || !survey_number || !bank_name || !account_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "PMK" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0]) 
                ? normalizePath(files[fieldName][0].path) 
                : null;
        };

        const applicationData = {
            user_id: userId,
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
            land_712_url: getFilePath('land_712'),
            bank_passbook_url: getFilePath('bank_passbook')
        };

        const applicationId = await PMKisanModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "PM Kisan application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get PM Kisan applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await PMKisanModel.getAll();
        } else {
            applications = await PMKisanModel.getByUserId(userId);
        }

        res.json({ success: true, data: applications });
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
        const application = await PMKisanModel.getByReferenceId(referenceId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        if (req.user.role === "USER" && application.user_id !== req.user.userId) {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }

        res.json({ success: true, data: application });
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

        await PMKisanModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};
