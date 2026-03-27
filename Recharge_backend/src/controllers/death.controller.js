const DeathModel = require("../models/death.model");
const path = require("path");
const { formatDateToMySQL } = require("../utils/date.helper");
const SmsService = require("../services/sms.service");

/**
 * Submit a new Death Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            deceased_name,
            deceased_aadhaar,
            gender,
            dob,
            date_of_death,
            time_of_death,
            place_of_death,
            hospital_name,
            cause_of_death,
            applicant_name,
            applicant_aadhaar,
            relationship,
            mobile_number,
            email,
            house_no,
            street,
            village,
            taluka,
            district,
            state,
            pincode,
            registration_type,
            delay_reason
        } = req.body;

        // Basic validation
        if (!deceased_name || !deceased_aadhaar || !date_of_death || !applicant_name) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Generate Reference ID
        const reference_id = "DEA" + Math.random().toString(36).substr(2, 9).toUpperCase();

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
            deceased_name,
            deceased_aadhaar,
            gender,
            dob: formatDateToMySQL(dob),
            date_of_death: formatDateToMySQL(date_of_death),
            time_of_death,
            place_of_death,
            hospital_name,
            cause_of_death,
            applicant_name,
            applicant_aadhaar,
            relationship,
            mobile_number,
            email,
            house_no,
            street,
            village,
            taluka,
            district,
            state,
            pincode,
            registration_type,
            delay_reason,
            reference_id,
            death_report_url: getFilePath('death_report'),
            deceased_aadhaar_url: getFilePath('deceased_aadhaar'),
            applicant_aadhaar_url: getFilePath('applicant_aadhaar'),
            address_proof_url: getFilePath('address_proof')
        };

        const applicationId = await DeathModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Death Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Death Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await DeathModel.getAll();
        } else {
            applications = await DeathModel.getByUserId(userId);
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
        const application = await DeathModel.getByReferenceId(referenceId);

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

        await DeathModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};

/* --- DEATH OTP CONTROLLERS --- */

exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhar_number } = req.body;
        if (!mobile_number || !aadhar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const purpose = req.body.purpose || "DEATH_APPLY";
        await DeathModel.storeOTP(mobile_number, otpCode, purpose);

        await SmsService.sendSMS(mobile_number, `Your OTP for Death Certificate Verification (Aadhaar: ****${aadhar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

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

        const purpose = req.body.purpose || "DEATH_APPLY";
        const isValid = await DeathModel.verifyOTP(mobile_number, otp_code, purpose);
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};
