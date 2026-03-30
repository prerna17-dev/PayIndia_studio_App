const AyushmanModel = require("../models/ayushman.model");
const SmsService = require("../services/sms.service");
const { formatDateToMySQL } = require("../utils/date.helper");

/**
 * Submit a new Ayushman Bharat application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            mobile_number,
            gender,
            dob,
            state,
            district,
            village,
            ration_card_number,
            eligibility_type,
            is_eligible,
            family_members // Expected as JSON string or Array
        } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !ration_card_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "PMJAY" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            mobile_number,
            gender,
            dob: dob ? formatDateToMySQL(dob) : null,
            state: state || "Maharashtra",
            district,
            village,
            ration_card_number,
            eligibility_type,
            is_eligible: is_eligible === 'true' || is_eligible === true,
            reference_id,
            aadhaar_head_url: normalizePath(files.aadhaar_head?.[0]?.path),
            ration_card_url: normalizePath(files.ration_card?.[0]?.path),
            address_proof_url: normalizePath(files.address_proof?.[0]?.path),
            photo_url: normalizePath(files.photo?.[0]?.path),
            secc_proof_url: normalizePath(files.secc_proof?.[0]?.path)
        };

        let members = [];
        if (family_members) {
            try {
                members = typeof family_members === 'string' ? JSON.parse(family_members) : family_members;
            } catch (e) {
                console.error("Error parsing family members:", e);
            }
        }

        const applicationId = await AyushmanModel.create(applicationData, members);

        res.status(201).json({
            success: true,
            message: "Ayushman Bharat application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Ayushman Bharat applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await AyushmanModel.getAll();
        } else {
            applications = await AyushmanModel.getByUserId(userId);
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
        const application = await AyushmanModel.getByReferenceId(referenceId);

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

        await AyushmanModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};

/**
 * Send OTP for application update verification
 */
exports.sendOtp = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;

        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar numbers are required" });
        }

        // Verify if application exists
        const application = await AyushmanModel.getByAadhaar(aadhaar_number);
        if (!application) {
            return res.status(404).json({ success: false, message: "No Ayushman application found for this Aadhaar number" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await SmsService.sendSMS(mobile_number, `Your OTP for Ayushman Bharat Update (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otp}. Valid for 10 mins.`);

        await AyushmanModel.storeOTP(mobile_number, otp, 'AYUSHMAN_UPDATE');

        res.json({ success: true, message: "OTP sent successfully to your mobile" });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for update
 */
exports.verifyOtp = async (req, res, next) => {
    try {
        const { mobile_number, otp } = req.body;
        const isValid = await AyushmanModel.verifyOTP(mobile_number, otp, 'AYUSHMAN_UPDATE');

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
 * Send OTP for New Application Verification
 */
exports.sendApplyOtp = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;
        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await SmsService.sendSMS(mobile_number, `Your OTP for Ayushman Bharat Verification (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otp}. Valid for 10 mins.`);

        await AyushmanModel.storeOTP(mobile_number, otp, 'AYUSHMAN_APPLY');
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
        const isValid = await AyushmanModel.verifyOTP(mobile_number, otp, 'AYUSHMAN_APPLY');

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
 * Submit Ayushman Bharat correction request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            mobile_number,
            aadhaar_number,
            correction_type,
            corrected_name,
            corrected_dob,
            corrected_gender,
            corrected_address,
            corrected_ration_card,
            other_details
        } = req.body;

        const reference_id = "PMJAY-COR" + Math.random().toString(36).substr(2, 7).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const application = await AyushmanModel.getByAadhaar(aadhaar_number);

        const correctionData = {
            user_id: userId,
            application_id: application ? application.id : null,
            mobile_number,
            aadhaar_number,
            correction_type,
            corrected_name,
            corrected_dob: corrected_dob ? formatDateToMySQL(corrected_dob) : null,
            corrected_gender,
            corrected_address,
            corrected_ration_card,
            other_details,
            aadhaar_url: normalizePath(files.aadhaar_card?.[0]?.path),
            ration_card_url: normalizePath(files.ration_card?.[0]?.path),
            address_proof_url: normalizePath(files.address_proof?.[0]?.path),
            photo_url: normalizePath(files.photo?.[0]?.path),
            secc_proof_url: normalizePath(files.secc_proof?.[0]?.path),
            reference_id
        };

        const correctionId = await AyushmanModel.createCorrection(correctionData);

        res.status(201).json({
            success: true,
            message: "Ayushman Bharat correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};
