const PMKisanModel = require("../models/pm_kisan.model");
const SmsService = require("../services/sms.service");

/**
 * Submit a new PM Kisan application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            farmer_name,
            aadhaar_number,
            mobile_number,
            gender,
            category,
            state,
            district,
            taluka,
            village,
            survey_number,
            land_area,
            ownership_type,
            bank_name,
            account_number,
            ifsc_code
        } = req.body;

        if (!farmer_name || !aadhaar_number || !mobile_number || !survey_number || !bank_name || !account_number) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "PMK" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0]) 
                ? normalizePath(files[fieldName][0].path) 
                : null;
        };

        const applicationData = {
            user_id: userId,
            farmer_name,
            aadhaar_number,
            mobile_number,
            gender,
            category,
            state,
            district,
            taluka,
            village,
            survey_number,
            land_area,
            ownership_type,
            bank_name,
            account_number,
            ifsc_code,
            reference_id,
            land_712_url: getFilePath('land_712'),
            bank_passbook_url: getFilePath('bank_passbook')
        };

        const applicationId = await PMKisanModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "PM Kisan application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get PM Kisan applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await PMKisanModel.getAll();
        } else {
            applications = await PMKisanModel.getByUserId(userId);
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
        const application = await PMKisanModel.getByReferenceId(referenceId);

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

        await PMKisanModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};

/**
 * Send OTP for PM Kisan
 */
exports.sendOtp = async (req, res, next) => {
    try {
        const { mobileNumber, aadhaarNumber, type } = req.body;
        if (!mobileNumber) {
            return res.status(400).json({ success: false, message: "Mobile number is required" });
        }

        // If Aadhaar is provided (ferfar flow style), check for existing registration
        if (aadhaarNumber) {
            const existing = await PMKisanModel.getByAadhaar(aadhaarNumber);
            
            if (type === 'apply' && existing) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Aadhaar number already registered with Ref ID: ${existing.reference_id}` 
                });
            }

            if (type === 'update' && !existing) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Aadhaar number not found in our records" 
                });
            }

            if (type === 'update' && existing.mobile_number !== mobileNumber) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Current mobile number does not match registered details" 
                });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await PMKisanModel.storeOTP(mobileNumber, otp);

        // Send SMS (logged to terminal)
        await SmsService.sendSMS(
            mobileNumber, 
            `Your OTP for PM-Kisan Verification (Aadhaar: ****${aadhaarNumber ? aadhaarNumber.slice(-4) : '####'}) is ${otp}. Valid for 10 mins.`
        );

        // In a real app, send SMS here. For now, simulate success.
        res.json({
            success: true,
            message: "OTP sent successfully",
            otp: process.env.NODE_ENV === "development" ? otp : undefined,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for PM Kisan
 */
exports.verifyOtp = async (req, res, next) => {
    try {
        const { mobileNumber, otp } = req.body;
        if (!mobileNumber || !otp) {
            return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });
        }

        const isValid = await PMKisanModel.verifyOTP(mobileNumber, otp);
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Submit PM Kisan correction
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            mobile_number,
            aadhaar_number,
            correction_type,
            corrected_name,
            corrected_mobile,
            corrected_bank,
            corrected_land,
            other_details
        } = req.body;

        if (!mobile_number || !correction_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "UPK" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0]) 
                ? normalizePath(files[fieldName][0].path) 
                : null;
        };

        const correctionData = {
            user_id: userId,
            mobile_number,
            aadhaar_number,
            correction_type,
            corrected_name,
            corrected_mobile,
            corrected_bank,
            corrected_land,
            other_details,
            id_proof_url: getFilePath('id_proof'),
            supporting_doc_url: getFilePath('supporting_doc'),
            reference_id
        };

        const correctionId = await PMKisanModel.createCorrection(correctionData);

        res.status(201).json({
            success: true,
            message: "PM Kisan correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Check PM Kisan status (public)
 */
exports.checkStatus = async (req, res, next) => {
    try {
        const { idType, idNumber } = req.body;
        if (!idType || !idNumber) {
            return res.status(400).json({ success: false, message: "ID Type and Number are required" });
        }

        const data = await PMKisanModel.getByAadhaarOrRef(idNumber, idType);
        if (!data) {
            return res.status(404).json({ success: false, message: "No application found with these details" });
        }

        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};
