const DomicileModel = require("../models/domicile.model");
const path = require("path");
const SmsService = require("../services/sms.service");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Domicile Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            mobile_number,
            email,
            dob,
            gender,
            years_in_state,
            occupation,
            reason,
            house_no,
            street,
            village,
            taluka,
            district,
            state,
            pincode,
            is_student,
            school_name,
            standard
        } = req.body;

        // Basic validation
        if (!full_name || !aadhaar_number || !mobile_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "DOM" + Math.random().toString(36).substr(2, 9).toUpperCase();

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
            dob: formatDateToMySQL(dob),
            gender,
            years_in_state,
            occupation,
            reason,
            house_no,
            street,
            village,
            taluka,
            district,
            state,
            pincode,
            is_student,
            school_name,
            standard,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            ration_card_url: getFilePath('ration_card'),
            birth_cert_url: getFilePath('birth_cert'),
            school_leaving_url: getFilePath('school_leaving'),
            residence_proof_url: getFilePath('residence_proof'),
            self_declaration_url: getFilePath('self_declaration'),
            photo_url: getFilePath('photo')
        };

        const applicationId = await DomicileModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Domicile Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Domicile Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await DomicileModel.getAll();
        } else {
            applications = await DomicileModel.getByUserId(userId);
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
        const application = await DomicileModel.getByReferenceId(referenceId);

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

        await DomicileModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};

/* --- DOMICILE OTP CONTROLLERS --- */

exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhar_number } = req.body;
        if (!mobile_number || !aadhar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await DomicileModel.storeOTP(mobile_number, otpCode, "DOMICILE_APPLY");

        await SmsService.sendSMS(mobile_number, `Your OTP for Domicile Certificate Application (Aadhaar: ****${aadhar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const isValid = await DomicileModel.verifyOTP(mobile_number, otp_code, "DOMICILE_APPLY");
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};
