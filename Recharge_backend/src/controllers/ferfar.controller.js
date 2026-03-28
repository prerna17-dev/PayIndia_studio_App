const FerfarModel = require("../models/ferfar.model");
const SmsService = require("../services/sms.service");

/**
 * Submit a new Ferfar application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const full_name = req.body.full_name || req.body.fullName;
        const aadhaar_number = req.body.aadhaar_number || req.body.aadhaarNumber;
        const mobile_number = req.body.mobile_number || req.body.mobileNumber;
        const district = req.body.district;
        const taluka = req.body.taluka;
        const village = req.body.village;
        const survey_number = req.body.survey_number || req.body.surveyNumber;
        const mutation_type = req.body.mutation_type || req.body.mutationType;
        const other_reason = req.body.other_reason || req.body.otherReason || req.body.purpose;

        const khata_number = req.body.khata_number || req.body.khataNumber;

        if (!full_name || !aadhaar_number || !mobile_number || !district || !taluka || !village || !survey_number || !mutation_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "FER712" + Math.random().toString(36).substr(2, 7).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;
        const getFilePath = (fieldName) => {
            return (files[fieldName] && files[fieldName][0])
                ? normalizePath(files[fieldName][0].path)
                : null;
        };

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            mobile_number,
            khata_number,
            district,
            taluka,
            village,
            survey_number,
            mutation_type,
            other_reason,
            reference_id,
            id_proof_url: getFilePath('id_proof') || getFilePath('idProof'),
            aadhaar_card_url: getFilePath('aadhaar_card') || getFilePath('aadhaarCard'),
            mutation_record_url: getFilePath('mutation_doc') || getFilePath('prev712'),
            ownership_doc_url: getFilePath('ownership_doc') || getFilePath('saleDeed'),
            application_form_url: getFilePath('application_form'),
            prev_8a_url: getFilePath('prev8A'),
            legal_doc_url: getFilePath('legalDoc'),
            photo_url: getFilePath('photo'),
            other_doc_url: getFilePath('otherDoc')
        };

        const applicationId = await FerfarModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Ferfar application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Send OTP for Ferfar service
 */
exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;
        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await FerfarModel.storeOTP(mobile_number, otpCode);

        await SmsService.sendSMS(mobile_number, `Your OTP for Ferfar Verification (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for Ferfar service
 */
exports.verifyOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const isValid = await FerfarModel.verifyOTP(mobile_number, otp_code);
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Ferfar applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await FerfarModel.getAll();
        } else {
            applications = await FerfarModel.getByUserId(userId);
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
        const application = await FerfarModel.getByReferenceId(referenceId);

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

        await FerfarModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};

/**
 * Submit a Ferfar correction request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const ferfar_number = req.body.ferfar_number || req.body.ferfarNumber;
        const aadhaar_number = req.body.aadhaar_number || req.body.aadhaarNumber;
        const mobile_number = req.body.mobile_number || req.body.mobileNumber;
        const correction_type = req.body.correction_type || req.body.correctionType;
        const corrected_applicant_name = req.body.corrected_applicant_name || req.body.correctedApplicantName;
        const corrected_mutation_year = req.body.corrected_mutation_year || req.body.correctedMutationYear;
        const corrected_mutation_reason = req.body.corrected_mutation_reason || req.body.correctedMutationReason;
        const other_details = req.body.other_details || req.body.otherDetails;
        const khata_number = req.body.khata_number || req.body.khataNumber;

        if (!ferfar_number || !aadhaar_number || !mobile_number || !correction_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "CORFER" + Math.random().toString(36).substr(2, 7).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;
        
        const correctionData = {
            user_id: userId,
            ferfar_number,
            aadhaar_number,
            mobile_number,
            correction_type,
            corrected_applicant_name,
            corrected_mutation_year,
            corrected_mutation_reason,
            other_details,
            id_proof_url: (files.id_proof || files.idProof) ? normalizePath((files.id_proof || files.idProof)[0].path) : null,
            supporting_doc_url: (files.supporting_doc || files.supportingDoc) ? normalizePath((files.supporting_doc || files.supportingDoc)[0].path) : null,
            reference_id
        };

        const correctionId = await FerfarModel.createCorrection(correctionData);

        res.status(201).json({
            success: true,
            message: "Ferfar correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};
