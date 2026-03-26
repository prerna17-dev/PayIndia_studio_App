const BirthModel = require("../models/birth.model");
const path = require("path");
const SmsService = require("../services/sms.service");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Birth Certificate application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            applicant_mobile,
            applicant_aadhaar,
            email,
            child_name,
            gender,
            dob,
            time_of_birth,
            place_of_birth,
            hospital_name,
            registration_date,
            father_name,
            father_aadhaar,
            father_mobile,
            father_occupation,
            father_dob,
            father_marital_status,
            father_place_of_birth,
            father_address,
            mother_name,
            mother_aadhaar,
            mother_mobile,
            mother_occupation,
            mother_dob,
            mother_marital_status,
            mother_place_of_birth,
            mother_address,
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
        if (!child_name || !dob || !gender || !place_of_birth) {
            return res.status(400).json({ success: false, message: "Missing required child details" });
        }

        // Generate Reference ID
        const reference_id = "BRT" + Math.random().toString(36).substr(2, 9).toUpperCase();

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
            applicant_mobile,
            applicant_aadhaar,
            email,
            child_name,
            gender,
            dob: formatDateToMySQL(dob),
            time_of_birth,
            place_of_birth,
            hospital_name,
            registration_date: formatDateToMySQL(registration_date),
            father_name,
            father_aadhaar,
            father_mobile,
            father_occupation,
            father_dob: formatDateToMySQL(father_dob),
            father_marital_status,
            father_place_of_birth,
            father_address,
            mother_name,
            mother_aadhaar,
            mother_mobile,
            mother_occupation,
            mother_dob: formatDateToMySQL(mother_dob),
            mother_marital_status,
            mother_place_of_birth,
            mother_address,
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
            hospital_report_url: getFilePath('hospital_report'),
            father_aadhaar_card_url: getFilePath('father_aadhaar_card'),
            mother_aadhaar_card_url: getFilePath('mother_aadhaar_card'),
            address_proof_url: getFilePath('address_proof'),
            marriage_certificate_url: getFilePath('marriage_certificate'),
            affidavit_url: getFilePath('affidavit')
        };

        const applicationId = await BirthModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Birth Certificate application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Birth Certificate applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await BirthModel.getAll();
        } else {
            applications = await BirthModel.getByUserId(userId);
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
        const application = await BirthModel.getByReferenceId(referenceId);

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

        await BirthModel.updateStatus(id, status);

        res.json({
            success: true,
            message: `Application status updated to ${status}`,
        });
    } catch (err) {
        next(err);
    }
};

/* --- BIRTH OTP CONTROLLERS --- */

exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhar_number } = req.body;
        if (!mobile_number || !aadhar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const purpose = req.body.purpose || "BIRTH_APPLY";
        await BirthModel.storeOTP(mobile_number, otpCode, purpose);

        await SmsService.sendSMS(mobile_number, `Your OTP for Birth Certificate Verification (Aadhaar: ****${aadhar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

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

        const purpose = req.body.purpose || "BIRTH_APPLY";
        const isValid = await BirthModel.verifyOTP(mobile_number, otp_code, purpose);
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};
