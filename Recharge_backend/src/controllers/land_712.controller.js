const Land712Model = require("../models/land_712.model");
const SmsService = require("../services/sms.service");

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
            email,
            district,
            taluka,
            village,
            survey_number,
            sub_division_number,
            application_type,
            application_mode
        } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !district || !taluka || !village || !survey_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "EXT712" + Math.random().toString(36).substr(2, 7).toUpperCase();
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
            district,
            taluka,
            village,
            survey_number,
            sub_division_number,
            application_type,
            application_mode,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            id_proof_url: getFilePath('id_proof'),
            land_document_url: getFilePath('land_document'),
            ownership_doc_url: getFilePath('ownership_doc'),
            supporting_doc_url: getFilePath('supporting_doc'),
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
 * Send OTP for 7/12 service
 */
exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;
        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Land712Model.storeOTP(mobile_number, otpCode);

        await SmsService.sendSMS(mobile_number, `Your OTP for 7/12 Extract Verification (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for 7/12 service
 */
exports.verifyOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const isValid = await Land712Model.verifyOTP(mobile_number, otp_code);
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
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

/**
 * Submit a 7/12 correction request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            satbara_id,
            aadhaar_number,
            mobile_number,
            correction_type,
            corrected_name,
            corrected_area,
            corrected_occupant,
            corrected_land_use,
            other_details
        } = req.body;

        if (!satbara_id || !aadhaar_number || !mobile_number || !correction_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "COR712" + Math.random().toString(36).substr(2, 7).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        
        const correctionData = {
            user_id: userId,
            satbara_id,
            aadhaar_number,
            mobile_number,
            correction_type,
            corrected_name,
            corrected_area,
            corrected_occupant,
            corrected_land_use,
            other_details,
            id_proof_url: files.id_proof ? normalizePath(files.id_proof[0].path) : null,
            supporting_doc_url: files.supporting_doc ? normalizePath(files.supporting_doc[0].path) : null,
            reference_id
        };

        const correctionId = await Land712Model.createCorrection(correctionData);

        res.status(201).json({
            success: true,
            message: "7/12 correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};
