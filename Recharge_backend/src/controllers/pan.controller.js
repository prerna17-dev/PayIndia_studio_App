const PanModel = require("../models/pan.model");
const { formatDateToMySQL } = require("../utils/date.helper");
const path = require("path");
const fs = require("fs");
const SmsService = require("../services/sms.service");

/**
 * Submit a new PAN application with document uploads
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            father_name,
            mother_name,
            date_of_birth,
            mobile_number,
            email_address,
            aadhar_number,
            full_address,
            city,
            district,
            state,
            pincode,
        } = req.body;

        // Ensure application data is provided
        if (!full_name || !aadhar_number || !mobile_number) {
            return res.status(400).json({ success: false, message: "Missing required personal details" });
        }

        const applicationId = await PanModel.create({
            user_id: userId,
            full_name,
            father_name,
            mother_name,
            date_of_birth: date_of_birth ? formatDateToMySQL(date_of_birth) : null,
            mobile_number,
            email_address,
            aadhar_number,
            full_address,
            city,
            district,
            state,
            pincode,
        });

        // Handle File Uploads
        const documentFiles = req.files;
        if (documentFiles) {
            const uploadTasks = [];
            const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/.*src\/uploads\//, '') : null;

            if (documentFiles.aadhar_card) {
                uploadTasks.push(PanModel.addDocument(applicationId, 'Aadhaar', normalizePath(documentFiles.aadhar_card[0].path)));
            }
            if (documentFiles.address_proof) {
                uploadTasks.push(PanModel.addDocument(applicationId, 'Address_Proof', normalizePath(documentFiles.address_proof[0].path)));
            }
            if (documentFiles.dob_proof) {
                uploadTasks.push(PanModel.addDocument(applicationId, 'DOB_Proof', normalizePath(documentFiles.dob_proof[0].path)));
            }
            if (documentFiles.passport_photo) {
                uploadTasks.push(PanModel.addDocument(applicationId, 'Passport_Photo', normalizePath(documentFiles.passport_photo[0].path)));
            }

            await Promise.all(uploadTasks);
        }

        res.status(201).json({
            success: true,
            message: "PAN application and documents submitted successfully",
            data: { applicationId },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get PAN applications based on user role
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await PanModel.getAll();
        } else {
            applications = await PanModel.getByUserId(userId);
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
 * Get a single application by ID (includes documents)
 */
exports.getApplicationById = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const application = await PanModel.getById(applicationId);

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        // Basic authorization: user can only see their own application unless they are ADMIN/AGENT
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
 * Admin: Update application status (Approve/Reject)
 */
exports.updateStatus = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status, remarks } = req.body;
        const adminId = req.user.userId;

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Forbidden: Admin access only" });
        }

        await PanModel.updateStatus(applicationId, adminId, status, remarks);

        res.json({
            success: true,
            message: `Application ${status} successfully`,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Agent: Process/Finalize application
 */
exports.processApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { remarks } = req.body;
        const agentId = req.user.userId;

        if (req.user.role !== "AGENT" && req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Forbidden: Agent access only" });
        }

        const application = await PanModel.getById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        if (application.status !== "Approved") {
            return res.status(400).json({ success: false, message: "Only approved applications can be processed" });
        }

        await PanModel.processApplication(applicationId, agentId, remarks);

        res.json({
            success: true,
            message: "Application processed successfully",
        });
    } catch (err) {
        next(err);
    }
};

/* --- PAN REGISTRATION OTP --- */

/**
 * Send OTP for New PAN Registration
 */
exports.sendApplyOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhar_number } = req.body;
        if (!mobile_number || !aadhar_number) {
            return res.status(400).json({ success: false, message: "Mobile number and Aadhaar number are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await PanModel.storeOTP(mobile_number, otpCode, "PAN_APPLY");

        // Send SMS
        await SmsService.sendSMS(mobile_number, `Your OTP for PAN Application (Aadhaar: ****${aadhar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for New PAN Registration
 */
exports.verifyApplyOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });
        }

        const isValid = await PanModel.verifyOTP(mobile_number, otp_code, "PAN_APPLY");
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        res.json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (err) {
        next(err);
    }
};


/* --- PAN CORRECTION CONTROLLERS --- */

/**
 * Send OTP for PAN Correction
 */
exports.sendCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, pan_number } = req.body;
        if (!mobile_number || !pan_number) {
            return res.status(400).json({ success: false, message: "Mobile number and PAN number are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await PanModel.storeOTP(mobile_number, otpCode, "PAN_CORRECTION");

        // Send SMS
        await SmsService.sendSMS(mobile_number, `Your OTP for PAN Correction (PAN: ${pan_number}) is ${otpCode}. Valid for 10 mins.`);

        res.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for PAN Correction
 */
exports.verifyCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });
        }

        const isValid = await PanModel.verifyOTP(mobile_number, otp_code, "PAN_CORRECTION");
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        res.json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Submit PAN Correction Request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            pan_number,
            mobile_number,
            corrected_name,
            corrected_dob,
            corrected_date,
            corrected_father_name,
            corrected_contact,
            corrected_address,
            correction_type,
        } = req.body;

        if (!pan_number || !mobile_number) {
            return res.status(400).json({ success: false, message: "PAN number and mobile number are required" });
        }

        const correctionId = await PanModel.createCorrection({
            user_id: userId,
            pan_number,
            mobile_number,
            corrected_name,
            corrected_dob: (corrected_dob || corrected_date) ? formatDateToMySQL(corrected_dob || corrected_date) : null,
            corrected_father_name,
            corrected_contact,
            corrected_address,
            correction_type,
        });

        // Handle File Uploads
        const documentFiles = req.files;
        if (documentFiles) {
            const uploadTasks = [];
            const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

            if (documentFiles.proof_of_name) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Proof_of_Name', normalizePath(documentFiles.proof_of_name[0].path)));
            }
            if (documentFiles.identity_proof) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Identity_Proof', normalizePath(documentFiles.identity_proof[0].path)));
            }
            if (documentFiles.proof_of_dob) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Proof_of_DOB', normalizePath(documentFiles.proof_of_dob[0].path)));
            }
            if (documentFiles.photo_sign) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Photo_Sign', normalizePath(documentFiles.photo_sign[0].path)));
            }
            if (documentFiles.father_proof) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Father_Proof', normalizePath(documentFiles.father_proof[0].path)));
            }
            if (documentFiles.father_declare) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Father_Declare', normalizePath(documentFiles.father_declare[0].path)));
            }
            if (documentFiles.contact_proof) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Contact_Proof', normalizePath(documentFiles.contact_proof[0].path)));
            }
            if (documentFiles.address_proof) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Address_Proof', normalizePath(documentFiles.address_proof[0].path)));
            }
            if (documentFiles.address_id) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Address_ID', normalizePath(documentFiles.address_id[0].path)));
            }
            if (documentFiles.photo_passport) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Photo_Passport', normalizePath(documentFiles.photo_passport[0].path)));
            }
            if (documentFiles.photo_id) {
                uploadTasks.push(PanModel.addCorrectionDocument(correctionId, 'Photo_ID', normalizePath(documentFiles.photo_id[0].path)));
            }

            await Promise.all(uploadTasks);
        }

        res.status(201).json({
            success: true,
            message: "PAN correction request submitted successfully",
            data: { correctionId },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all PAN corrections
 */
exports.getCorrections = async (req, res, next) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "AGENT") {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }

        const corrections = await PanModel.getAllCorrections();
        res.json({
            success: true,
            data: corrections,
        });
    } catch (err) {
        next(err);
    }
};
