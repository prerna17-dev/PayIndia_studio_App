const UdyamModel = require("../models/udyam.model");

/**
 * Submit a new Udyam Registration application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            pan_number,
            mobile_number,
            email,
            organization_type,
            gender,
            category,
            disability,
            unit_name,
            location,
            office_address,
            bank_name,
            ifsc,
            account_number,
            business_activity,
            employees_count,
            investment,
            turnover,
            registration_date
        } = req.body;

        if (!full_name || !aadhaar_number || !pan_number || !mobile_number || !unit_name) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "UDY" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            pan_number,
            mobile_number,
            email,
            organization_type,
            gender,
            category,
            disability,
            unit_name,
            location,
            office_address,
            bank_name,
            ifsc,
            account_number,
            business_activity,
            employees_count,
            investment,
            turnover,
            registration_date,
            reference_id,
            aadhaar_card_url: normalizePath(files.aadhaar_card?.[0]?.path),
            pan_card_url: normalizePath(files.pan_card?.[0]?.path),
            bank_passbook_url: normalizePath(files.bank_passbook?.[0]?.path),
            photo_url: normalizePath(files.photo?.[0]?.path)
        };

        const applicationId = await UdyamModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Udyam Registration application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Udyam Registration applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await UdyamModel.getAll();
        } else {
            applications = await UdyamModel.getByUserId(userId);
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
        const application = await UdyamModel.getByReferenceId(referenceId);

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

        await UdyamModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};

/**
 * Submit Udyam Correction Request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            udyam_number,
            aadhaar_number,
            update_type,
            new_value
        } = req.body;

        if (!udyam_number || !aadhaar_number || !update_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const correctionId = await UdyamModel.createCorrection({
            user_id: userId,
            udyam_number,
            aadhaar_number,
            update_type,
            new_value
        });

        // Handle File Uploads
        const files = req.files || {};
        const uploadTasks = [];
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        Object.keys(files).forEach(fieldName => {
            const file = files[fieldName][0];
            uploadTasks.push(UdyamModel.addCorrectionDocument(correctionId, fieldName, normalizePath(file.path)));
        });

        await Promise.all(uploadTasks);

        res.status(201).json({
            success: true,
            message: "Udyam correction request submitted successfully",
            data: { correctionId },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all Udyam corrections
 */
exports.getCorrections = async (req, res, next) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "AGENT") {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }

        const corrections = await UdyamModel.getAllCorrections();
        res.json({ success: true, data: corrections });
    } catch (err) {
        next(err);
    }
};
