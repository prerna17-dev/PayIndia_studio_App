const CasteModel = require("../models/caste.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");
const SmsService = require("../services/sms.service");

/**
 * Submit a new Caste Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const user_id = req.user.user_id || req.user.userId;
        const {
            full_name,
            aadhaar_number,
            mobile_number,
            email,
            dob,
            gender,
            category,
            sub_caste,
            religion,
            father_name,
            father_caste,
            mother_name,
            domicile_status,
            house_no,
            street,
            village,
            district,
            state,
            pincode,
            father_aadhaar,
            father_occupation,
            existing_certificate_no,
            previously_issued,
            duration_of_residence
        } = req.body;

        // Basic validation
        if (!full_name || !aadhaar_number || !mobile_number) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Generate Reference ID
        const reference_id = "CASTE" + Date.now().toString().slice(-8);

        // Handle file uploads
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0])
                ? normalizePath(files[fieldName][0].path)
                : null;
        };

        const applicationData = {
            user_id,
            full_name,
            aadhaar_number,
            mobile_number,
            email,
            dob: formatDateToMySQL(dob),
            gender,
            category,
            sub_caste,
            religion,
            father_name,
            father_caste,
            mother_name,
            domicile_status,
            house_no,
            street,
            village,
            district,
            state,
            pincode,
            father_aadhaar,
            father_occupation,
            existing_certificate_no,
            previously_issued,
            duration_of_residence,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            ration_card_url: getFilePath('ration_card'),
            school_leaving_url: getFilePath('school_leaving'),
            caste_proof_url: getFilePath('caste_proof'),
            father_caste_cert_url: getFilePath('father_caste_cert'),
            self_declaration_url: getFilePath('self_declaration'),
            photo_url: getFilePath('photo')
        };

        const applicationId = await CasteModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: { applicationId, reference_id }
        });

    } catch (err) {
        console.error("Caste App Error:", err);
        next(err);
    }
};

/**
 * Get all applications for current user
 */
exports.getApplications = async (req, res, next) => {
    try {
        const userId = req.user.user_id || req.user.userId;
        const applications = await CasteModel.getByUserId(userId);
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
        const application = await CasteModel.getByReferenceId(referenceId);
        if (!application) return res.status(404).json({ success: false, message: "Application not found" });
        res.json({ success: true, data: application });
    } catch (err) {
        next(err);
    }
};

/**
 * Update application status (Admin only)
 */
exports.updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await CasteModel.updateStatus(id, status);
        res.json({ success: true, message: "Status updated successfully" });
    } catch (err) {
        next(err);
    }
};

/* --- CASTE OTP CONTROLLERS --- */

exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhar_number } = req.body;
        if (!mobile_number || !aadhar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await CasteModel.storeOTP(mobile_number, otpCode, "CASTE_APPLY");

        await SmsService.sendSMS(mobile_number, `Your OTP for Caste Certificate Application (Aadhaar: ****${aadhar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

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

        const isValid = await CasteModel.verifyOTP(mobile_number, otp_code, "CASTE_APPLY");
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};

