const Land712Model = require("../models/land_712.model");

/**
 * Submit a new 7/12 Extract application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            mobile_number,
            district,
            taluka,
            village,
            survey_number
        } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !district || !taluka || !village || !survey_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "712" + Math.random().toString(36).substr(2, 9).toUpperCase();
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
            district,
            taluka,
            village,
            survey_number,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            land_document_url: getFilePath('land_document'),
            photo_url: getFilePath('photo')
        };

        const applicationId = await Land712Model.create(applicationData);

        res.status(201).json({
            success: true,
            message: "7/12 Extract application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get 7/12 Extract applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await Land712Model.getAll();
        } else {
            applications = await Land712Model.getByUserId(userId);
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
        const application = await Land712Model.getByReferenceId(referenceId);

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

        await Land712Model.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};
