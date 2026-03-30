const EmploymentModel = require("../models/employment.model");
const SmsService = require("../services/sms.service");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Employment Registration application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            dob,
            gender,
            category,
            mobile_number,
            email,
            house_no,
            area,
            village,
            taluka,
            district,
            pincode,
            employment_status,
            experience_years,
            qualification,
            computer_skills,
            languages,
            pref_sector
        } = req.body;

        if (!full_name || !aadhaar_number || !dob || !mobile_number || !employment_status || !qualification || !pref_sector) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "EMP" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            dob: formatDateToMySQL(dob),
            gender,
            category,
            mobile_number,
            email,
            house_no,
            area,
            village,
            taluka,
            district,
            pincode,
            employment_status,
            experience_years: experience_years || 0,
            qualification,
            computer_skills,
            languages,
            pref_sector,
            reference_id,
            aadhaar_card_url: normalizePath(files.aadhaar_card?.[0]?.path),
            education_cert_url: normalizePath(files.education_cert?.[0]?.path),
            photo_url: normalizePath(files.photo?.[0]?.path),
            experience_cert_url: normalizePath(files.experience_cert?.[0]?.path),
            caste_cert_url: normalizePath(files.caste_cert?.[0]?.path)
        };

        const applicationId = await EmploymentModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Employment Registration application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Employment Registration applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await EmploymentModel.getAll();
        } else {
            applications = await EmploymentModel.getByUserId(userId);
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
        const application = await EmploymentModel.getByReferenceId(referenceId);

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

        await EmploymentModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};

/**
 * Send OTP for New Application
 */
exports.sendApplyOtp = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;
        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Log OTP in specific format via SmsService
        await SmsService.sendSMS(mobile_number, `Your OTP for Employment Registration Verification (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otp}. Valid for 10 mins.`);

        await EmploymentModel.storeOTP(mobile_number, otp, 'EMPLOYMENT_APPLY');
        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for New Application
 */
exports.verifyApplyOtp = async (req, res, next) => {
    try {
        const { mobile_number, otp } = req.body;
        const isValid = await EmploymentModel.verifyOTP(mobile_number, otp, 'EMPLOYMENT_APPLY');

        if (isValid) {
            res.json({ success: true, message: "Aadhaar verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch (err) {
        next(err);
    }
};

/**
 * Send OTP for Correction Request
 */
exports.sendCorrectionOtp = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;
        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar numbers are required" });
        }

        // Verify if application exists for this Aadhaar
        const application = await EmploymentModel.getByAadhaar(aadhaar_number);
        if (!application) {
            return res.status(404).json({ success: false, message: "No application found for this Aadhaar number" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Log OTP in specific format
        await SmsService.sendSMS(mobile_number, `Your OTP for Employment Correction Verification (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otp}. Valid for 10 mins.`);

        await EmploymentModel.storeOTP(mobile_number, otp, 'EMPLOYMENT_CORRECTION');
        res.json({ success: true, message: "OTP sent successfully to registered mobile" });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for Correction
 */
exports.verifyCorrectionOtp = async (req, res, next) => {
    try {
        const { mobile_number, otp, otp_code } = req.body;
        const code = otp_code || otp; // Support both names for compatibility
        const isValid = await EmploymentModel.verifyOTP(mobile_number, code, 'EMPLOYMENT_CORRECTION');

        if (isValid) {
            res.json({ success: true, message: "OTP verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
    } catch (err) {
        next(err);
    }
};

/**
 * Submit correction request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            registration_id,
            mobile_number,
            aadhaar_number,
            correction_type,
            corrected_name,
            corrected_dob,
            corrected_address,
            corrected_qualification,
            corrected_experience,
            corrected_skills,
            other_details
        } = req.body;

        const reference_id = "EMP-COR" + Math.random().toString(36).substr(2, 7).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const correctionData = {
            user_id: userId,
            registration_id,
            mobile_number,
            aadhaar_number: aadhaar_number || req.body.aadhaar_no, // Support both naming variations
            correction_type,
            corrected_name,
            corrected_dob: corrected_dob ? formatDateToMySQL(corrected_dob) : null,
            corrected_address,
            corrected_qualification,
            corrected_experience,
            corrected_skills,
            other_details,
            aadhaar_url: normalizePath(files.aadhaar_card?.[0]?.path),
            education_cert_url: normalizePath(files.education_cert?.[0]?.path),
            experience_cert_url: normalizePath(files.experience_cert?.[0]?.path),
            photo_url: normalizePath(files.photo?.[0]?.path),
            supporting_doc_url: normalizePath(files.supporting_doc?.[0]?.path),
            reference_id
        };

        const correctionId = await EmploymentModel.createCorrection(correctionData);

        res.status(201).json({
            success: true,
            message: "Employment correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};
