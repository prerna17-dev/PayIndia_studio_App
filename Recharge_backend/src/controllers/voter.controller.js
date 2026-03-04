const VoterModel = require("../models/voter.model");
const SmsService = require("../services/sms.service");

/**
 * Submit a new Voter application with document uploads
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            date_of_birth,
            gender,
            aadhar_number,
            house_no,
            assembly_constituency,
            city,
            district,
            state,
            pincode,
            mobile_number,
        } = req.body;

        // Ensure application data is provided
        if (!full_name || !aadhar_number || !mobile_number) {
            return res.status(400).json({ success: false, message: "Missing required personal details" });
        }

        const applicationId = await VoterModel.create({
            user_id: userId,
            full_name,
            date_of_birth,
            gender,
            aadhar_number,
            house_no,
            assembly_constituency,
            city,
            district,
            state,
            pincode,
            mobile_number,
        });

        // Handle File Uploads
        const documentFiles = req.files;
        if (documentFiles) {
            const uploadTasks = [];

            if (documentFiles.aadhar_card) {
                uploadTasks.push(VoterModel.addDocument(applicationId, 'Aadhaar', documentFiles.aadhar_card[0].path));
            }
            if (documentFiles.address_proof) {
                uploadTasks.push(VoterModel.addDocument(applicationId, 'Address_Proof', documentFiles.address_proof[0].path));
            }
            if (documentFiles.dob_proof) {
                uploadTasks.push(VoterModel.addDocument(applicationId, 'DOB_Proof', documentFiles.dob_proof[0].path));
            }
            if (documentFiles.passport_photo) {
                uploadTasks.push(VoterModel.addDocument(applicationId, 'Passport_Photo', documentFiles.passport_photo[0].path));
            }

            await Promise.all(uploadTasks);
        }

        res.status(201).json({
            success: true,
            message: "Voter application and documents submitted successfully",
            data: { applicationId },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Voter applications based on user role
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await VoterModel.getAll();
        } else {
            applications = await VoterModel.getByUserId(userId);
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
        const application = await VoterModel.getById(applicationId);

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

        await VoterModel.updateStatus(applicationId, adminId, status, remarks);

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

        const application = await VoterModel.getById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        if (application.status !== "Approved") {
            return res.status(400).json({ success: false, message: "Only approved applications can be processed" });
        }

        await VoterModel.processApplication(applicationId, agentId, remarks);

        res.json({
            success: true,
            message: "Application processed successfully",
        });
    } catch (err) {
        next(err);
    }
};

/* --- VOTER CORRECTION CONTROLLERS --- */

/**
 * Send OTP for Voter Correction
 */
exports.sendCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, voter_id_number } = req.body;
        if (!mobile_number || !voter_id_number) {
            return res.status(400).json({ success: false, message: "Mobile number and Voter ID number are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await VoterModel.storeOTP(mobile_number, otpCode, "VOTER_CORRECTION");

        // Send SMS
        await SmsService.sendSMS(mobile_number, `Your OTP for Voter Correction (Voter ID: ${voter_id_number}) is ${otpCode}. Valid for 10 mins.`);

        res.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for Voter Correction
 */
exports.verifyCorrectionOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile number and OTP are required" });
        }

        const isValid = await VoterModel.verifyOTP(mobile_number, otp_code, "VOTER_CORRECTION");
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
 * Submit Voter Correction Request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            voter_id_number,
            aadhar_number,
            mobile_number,
        } = req.body;

        if (!voter_id_number || !mobile_number) {
            return res.status(400).json({ success: false, message: "Voter ID number and mobile number are required" });
        }

        const correctionId = await VoterModel.createCorrection({
            user_id: userId,
            voter_id_number,
            aadhar_number,
            mobile_number,
        });

        // Handle File Uploads
        const documentFiles = req.files;
        if (documentFiles) {
            const uploadTasks = [];

            if (documentFiles.identity_proof) {
                uploadTasks.push(VoterModel.addCorrectionDocument(correctionId, 'Identity_Proof', documentFiles.identity_proof[0].path));
            }
            if (documentFiles.address_proof) {
                uploadTasks.push(VoterModel.addCorrectionDocument(correctionId, 'Address_Proof', documentFiles.address_proof[0].path));
            }
            if (documentFiles.dob_proof) {
                uploadTasks.push(VoterModel.addCorrectionDocument(correctionId, 'DOB_Proof', documentFiles.dob_proof[0].path));
            }
            if (documentFiles.photo) {
                uploadTasks.push(VoterModel.addCorrectionDocument(correctionId, 'Photo', documentFiles.photo[0].path));
            }

            await Promise.all(uploadTasks);
        }

        res.status(201).json({
            success: true,
            message: "Voter correction request submitted successfully",
            data: { correctionId },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all Voter corrections
 */
exports.getCorrections = async (req, res, next) => {
    try {
        const { role } = req.user;
        if (role !== "ADMIN" && role !== "AGENT") {
            return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
        }

        const corrections = await VoterModel.getAllCorrections();
        res.json({
            success: true,
            data: corrections,
        });
    } catch (err) {
        next(err);
    }
};
