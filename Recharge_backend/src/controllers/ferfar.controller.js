const FerfarModel = require("../models/ferfar.model");

/**
 * Submit a new Ferfar application
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
            survey_number,
            mutation_type
        } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !district || !taluka || !village || !survey_number || !mutation_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "FER" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            mobile_number,
            district,
            taluka,
            village,
            survey_number,
            mutation_type,
            reference_id,
            aadhaar_card_url: normalizePath(files.aadhaar_card?.[0]?.path),
            index_2_url: normalizePath(files.index_2?.[0]?.path),
            death_cert_url: normalizePath(files.death_cert?.[0]?.path),
            ferfar_cert_url: normalizePath(files.ferfar_cert?.[0]?.path)
        };

        const applicationId = await FerfarModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Ferfar application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Ferfar applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await FerfarModel.getAll();
        } else {
            applications = await FerfarModel.getByUserId(userId);
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
        const application = await FerfarModel.getByReferenceId(referenceId);

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

        await FerfarModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};
