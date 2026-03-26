const RationCard = require("../models/ration_card.model");
const { formatDateToMySQL } = require("../utils/date.helper");
const SmsService = require("../services/sms.service");

/**
 * Create a new Ration Card application
 */
exports.createApplication = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            mobile_number,
            dob,
            gender,
            house_no,
            street,
            village,
            district,
            state,
            pincode,
            duration_of_stay,
            total_income,
            income_category,
            occupation,
            gas_consumer_no,
            gas_agency_name,
            gas_status,
            members // JSON string from frontend
        } = req.body;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            mobile_number,
            dob: formatDateToMySQL(dob),
            gender,
            house_no,
            street,
            village,
            district,
            state,
            pincode,
            duration_of_stay,
            total_income,
            income_category,
            occupation,
            gas_consumer_no,
            gas_agency_name,
            gas_status
        };

        const applicationId = await RationCard.create(applicationData);

        // Add family members
        if (members) {
            const familyMembers = JSON.parse(members);
            for (const member of familyMembers) {
                await RationCard.addMember(applicationId, member);
            }
        }

        // Handle file uploads
        if (req.files) {
            const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
            for (const fieldname in req.files) {
                const file = req.files[fieldname][0];
                const normalizedPath = normalizePath(file.path);
                await RationCard.addDocument(applicationId, fieldname, normalizedPath);
            }
        }

        res.status(201).json({
            success: true,
            message: "Ration Card application submitted successfully",
            data: { applicationId }
        });
    } catch (error) {
        console.error("Ration Card Application Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit Ration Card application",
            error: error.message
        });
    }
};

/**
 * Create a new Ration Card correction request
 */
exports.createCorrection = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            ration_card_number,
            head_aadhaar,
            update_types,
            update_details
        } = req.body;

        const correctionData = {
            user_id: userId,
            ration_card_number,
            head_aadhaar,
            update_types,
            update_details
        };

        const correctionId = await RationCard.createCorrection(correctionData);

        // Handle file uploads
        if (req.files) {
            const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
            // req.files can be an array if upload.any() is used, let's normalize
            if (Array.isArray(req.files)) {
                for (const file of req.files) {
                    const normalizedPath = normalizePath(file.path);
                    await RationCard.addCorrectionDocument(correctionId, file.fieldname, normalizedPath);
                }
            } else {
                for (const fieldname in req.files) {
                    const file = req.files[fieldname][0];
                    const normalizedPath = normalizePath(file.path);
                    await RationCard.addCorrectionDocument(correctionId, fieldname, normalizedPath);
                }
            }
        }

        res.status(201).json({
            success: true,
            message: "Ration Card correction request submitted successfully",
            data: { correctionId }
        });
    } catch (error) {
        console.error("Ration Card Correction Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit Ration Card correction request",
            error: error.message
        });
    }
};

/**
 * Get user's Ration Card applications
 */
exports.getMyApplications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const applications = await RationCard.getByUserId(userId);
        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch applications",
            error: error.message
        });
    }
};

/**
 * Get Ration Card application details by ID
 */
exports.getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await RationCard.getById(id);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found"
            });
        }
        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch application details",
            error: error.message
        });
    }
};

/* --- RATION CARD OTP CONTROLLERS --- */

exports.sendApplyOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhar_number } = req.body;
        if (!mobile_number || !aadhar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await RationCard.storeOTP(mobile_number, otpCode, "RATION_APPLY");

        await SmsService.sendSMS(mobile_number, `Your OTP for Ration Card Application (Aadhaar: ****${aadhar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

exports.verifyApplyOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const isValid = await RationCard.verifyOTP(mobile_number, otp_code, "RATION_APPLY");
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};

exports.sendCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, ration_card_number } = req.body;
        if (!mobile_number || !ration_card_number) {
            return res.status(400).json({ success: false, message: "Mobile and Ration Card Number are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await RationCard.storeOTP(mobile_number, otpCode, "RATION_CORRECTION");

        await SmsService.sendSMS(mobile_number, `Your OTP for Ration Card Correction (Ration Card: ****${ration_card_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

exports.verifyCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const isValid = await RationCard.verifyOTP(mobile_number, otp_code, "RATION_CORRECTION");
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};
