const MarriageModel = require("../models/marriage.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Marriage Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            groom_name,
            groom_aadhaar,
            groom_dob,
            groom_age,
            groom_occupation,
            groom_mobile,
            groom_email,
            bride_name,
            bride_aadhaar,
            bride_dob,
            bride_age,
            bride_occupation,
            bride_mobile,
            bride_email,
            date_of_marriage,
            place_of_marriage,
            marriage_address,
            type_of_marriage,
            w1_name,
            w1_aadhaar,
            w1_address,
            w1_mobile,
            w2_name,
            w2_aadhaar,
            w2_address,
            w2_mobile
        } = req.body;

        // Basic validation
        if (!groom_name || !groom_aadhaar || !bride_name || !bride_aadhaar || !date_of_marriage) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "MAR" + Math.random().toString(36).substr(2, 9).toUpperCase();

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
            groom_name,
            groom_aadhaar,
            groom_dob: formatDateToMySQL(groom_dob),
            groom_age,
            groom_occupation,
            groom_mobile,
            groom_email,
            bride_name,
            bride_aadhaar,
            bride_dob: formatDateToMySQL(bride_dob),
            bride_age,
            bride_occupation,
            bride_mobile,
            bride_email,
            date_of_marriage: formatDateToMySQL(date_of_marriage),
            place_of_marriage,
            marriage_address,
            type_of_marriage,
            w1_name,
            w1_aadhaar,
            w1_address,
            w1_mobile,
            w2_name,
            w2_aadhaar,
            w2_address,
            w2_mobile,
            reference_id,
            groom_aadhaar_url: getFilePath('groom_aadhaar'),
            bride_aadhaar_url: getFilePath('bride_aadhaar'),
            invitation_card_url: getFilePath('invitation_card'),
            venue_proof_url: getFilePath('venue_proof'),
            marriage_photos_url: getFilePath('marriage_photos'),
            w1_aadhaar_url: getFilePath('w1_aadhaar'),
            w2_aadhaar_url: getFilePath('w2_aadhaar'),
            w1_photo_url: getFilePath('w1_photo'),
            w2_photo_url: getFilePath('w2_photo'),
            address_proof_url: getFilePath('address_proof')
        };

        const applicationId = await MarriageModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Marriage Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Marriage Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await MarriageModel.getAll();
        } else {
            applications = await MarriageModel.getByUserId(userId);
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
        const application = await MarriageModel.getByReferenceId(referenceId);

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

        await MarriageModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};
