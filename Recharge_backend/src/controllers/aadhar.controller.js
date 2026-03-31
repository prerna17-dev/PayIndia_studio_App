const AadharModel = require("../models/aadhar.model");
const { formatDateToMySQL } = require("../utils/date.helper");
const SmsService = require("../services/sms.service");

/**
 * Submit a new Aadhar enrollment
 */
exports.createEnrollment = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Map uploaded files
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        // Generate Reference ID (e.g., AADHAAR378E)
        const reference_id = "AADHAAR" + Math.random().toString(36).substring(2, 6).toUpperCase();

        const enrollmentId = await AadharModel.create({
            ...req.body,
            user_id: userId,
            reference_id,
            birth_certificate_url: normalizePath(files.birth_certificate?.[0]?.path),
            school_certificate_url: normalizePath(files.school_certificate?.[0]?.path),
            address_proof_url: normalizePath(files.address_proof?.[0]?.path),
            parent_aadhaar_url: normalizePath(files.parent_aadhaar?.[0]?.path),
            parent_name: req.body.parent_name,
            parent_aadhaar_number: req.body.parent_aadhaar_number,
            relationship: req.body.relationship
        });

        res.status(201).json({
            success: true,
            message: "Aadhar enrollment submitted successfully",
            data: { enrollmentId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get enrollments based on user role
 */
exports.getEnrollments = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let enrollments;

        if (role === "ADMIN" || role === "AGENT") {
            enrollments = await AadharModel.getAll();
        } else {
            enrollments = await AadharModel.getByUserId(userId);
        }

        res.json({
            success: true,
            data: enrollments,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Admin: Update enrollment status (Approve/Reject)
 */
exports.updateStatus = async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;
        const { status, remarks } = req.body;
        const adminId = req.user.userId;

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden: Admin access only" });
        }

        await AadharModel.updateStatus(enrollmentId, adminId, status, remarks);

        res.json({
            success: true,
            message: `Enrollment ${status} successfully`,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Agent: Process/Finalize enrollment
 */
exports.processEnrollment = async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;
        const { remarks } = req.body;
        const agentId = req.user.userId;

        if (req.user.role !== "AGENT" && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden: Agent access only" });
        }

        const enrollment = await AadharModel.getById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }

        if (enrollment.status !== "Approved") {
            return res.status(400).json({ message: "Only approved enrollments can be processed" });
        }

        await AadharModel.processEnrollment(enrollmentId, agentId, remarks);

        res.json({
            success: true,
            message: "Enrollment processed successfully",
        });
    } catch (err) {
        next(err);
    }
};

/* --- AADHAAR CORRECTION CONTROLLERS --- */

/**
 * Send OTP for Aadhaar Correction
 */
exports.sendCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhar_number } = req.body;
        if (!mobile_number || !aadhar_number) {
            return res.status(400).json({ success: false, message: "Mobile number and Aadhaar number are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await AadharModel.storeOTP(mobile_number, otpCode, "AADHAAR_CORRECTION");

        // Send SMS
        await SmsService.sendSMS(mobile_number, `Your OTP for Aadhaar Correction (Aadhaar: ${aadhar_number}) is ${otpCode}. Valid for 10 mins.`);

        res.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for Aadhaar Correction
 */
exports.verifyCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });
        }

        const isValid = await AadharModel.verifyOTP(mobile_number, otp_code, "AADHAAR_CORRECTION");
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
 * Submit Aadhaar Correction Request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            aadhar_number,
            mobile_number,
            corrected_name,
            corrected_dob,
            correction_type,
        } = req.body;

        if (!aadhar_number || !mobile_number) {
            return res.status(400).json({ success: false, message: "Aadhaar number and mobile number are required" });
        }

        const reference_id = "UPAADH" + Math.random().toString(36).substr(2, 6).toUpperCase();
        const correctionId = await AadharModel.createCorrection({
            user_id: userId,
            aadhar_number,
            mobile_number,
            corrected_name,
            corrected_dob: corrected_dob ? formatDateToMySQL(corrected_dob) : null,
            correction_type,
            reference_id,
        });

        // Handle File Uploads
        const files = req.files || {};
        const uploadTasks = [];

        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        if (files.identity_proof) {
            uploadTasks.push(AadharModel.addCorrectionDocument(correctionId, 'Identity_Proof', normalizePath(files.identity_proof[0].path)));
        }
        if (files.identity_proof_2) {
            uploadTasks.push(AadharModel.addCorrectionDocument(correctionId, 'Identity_Proof_2', normalizePath(files.identity_proof_2[0].path)));
        }
        if (files.address_proof) {
            uploadTasks.push(AadharModel.addCorrectionDocument(correctionId, 'Address_Proof', normalizePath(files.address_proof[0].path)));
        }
        if (files.address_proof_2) {
            uploadTasks.push(AadharModel.addCorrectionDocument(correctionId, 'Address_Proof_2', normalizePath(files.address_proof_2[0].path)));
        }
        if (files.dob_proof) {
            uploadTasks.push(AadharModel.addCorrectionDocument(correctionId, 'DOB_Proof', normalizePath(files.dob_proof[0].path)));
        }
        if (files.photo) {
            uploadTasks.push(AadharModel.addCorrectionDocument(correctionId, 'Photo', normalizePath(files.photo[0].path)));
        }

        await Promise.all(uploadTasks);

        res.status(201).json({
            success: true,
            message: "Aadhaar correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all Aadhaar corrections
 */
exports.getCorrections = async (req, res, next) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "AGENT") {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }

        const corrections = await AadharModel.getAllCorrections();
        res.json({
            success: true,
            data: corrections,
        });
    } catch (err) {
        next(err);
    }
};

