const Land8aModel = require("../models/land_8a.model");

/**
 * Submit a new 8A Extract application
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
            account_number
        } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !district || !taluka || !village || !account_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "8A" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const getFilePath = (fieldName) => files[fieldName] ? files[fieldName][0].path : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            mobile_number,
            district,
            taluka,
            village,
            account_number,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            holding_document_url: getFilePath('holding_document'),
            photo_url: getFilePath('photo')
        };

        const applicationId = await Land8aModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "8A Extract application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get 8A Extract applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await Land8aModel.getAll();
        } else {
            applications = await Land8aModel.getByUserId(userId);
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
        const application = await Land8aModel.getByReferenceId(referenceId);

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

        await Land8aModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};
