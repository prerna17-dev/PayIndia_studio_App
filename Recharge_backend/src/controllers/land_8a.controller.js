const Land8aModel = require("../models/land_8a.model");
const SmsService = require("../services/sms.service");

/**
 * Submit a new 8A Extract application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const account_number = req.body.account_number || req.body.khata_number || req.body.khataNumber;
        const full_name = req.body.full_name || req.body.fullName;
        const aadhaar_number = req.body.aadhaar_number || req.body.aadhaarNumber;
        const mobile_number = req.body.mobile_number || req.body.mobileNumber;
        const { district, taluka, village } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !district || !taluka || !village || !account_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "8A" + Math.random().toString(36).substr(2, 9).toUpperCase();
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
            account_number,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            ownership_proof_url: getFilePath('ownership_proof'),
            property_details_url: getFilePath('property_details_doc'),
            previous_8a_url: getFilePath('previous_8a') || getFilePath('previous8_a'),
            mutation_record_url: getFilePath('mutation_record')
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

/**
 * Send OTP for 8A service
 */
exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;
        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Land8aModel.storeOTP(mobile_number, otpCode);

        await SmsService.sendSMS(mobile_number, `Your OTP for 8A Extract Verification (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for 8A service
 */
exports.verifyOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const isValid = await Land8aModel.verifyOTP(mobile_number, otp_code);
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Submit a correction request for 8A Extract
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const account_number = req.body.account_number || req.body.khata_number || req.body.khataNumber;
        const full_name = req.body.full_name || req.body.fullName;
        const aadhaar_number = req.body.aadhaar_number || req.body.aadhaarNumber;
        const mobile_number = req.body.mobile_number || req.body.mobileNumber;
        const { district, taluka, village, correction_type, corrected_name, corrected_area, corrected_occupant, corrected_land_use, other_details } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !account_number || !correction_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "8AC" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0]) 
                ? normalizePath(files[fieldName][0].path) 
                : null;
        };

        const correctionData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            mobile_number,
            account_number,
            district,
            taluka,
            village,
            correction_type,
            corrected_name,
            corrected_area,
            corrected_occupant,
            corrected_land_use,
            other_details,
            id_proof_url: getFilePath('id_proof'),
            supporting_doc_url: getFilePath('supporting_doc'),
            reference_id
        };

        const correctionId = await Land8aModel.createCorrection(correctionData);

        res.status(201).json({
            success: true,
            message: "8A Correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};
