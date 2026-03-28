const PropertyTaxModel = require("../models/property_tax.model");
const SmsService = require("../services/sms.service");

/**
 * Send OTP for Property Tax service
 */
exports.sendOTP = async (req, res, next) => {
    try {
        const { mobile_number, aadhaar_number } = req.body;
        if (!mobile_number || !aadhaar_number) {
            return res.status(400).json({ success: false, message: "Mobile and Aadhaar are required" });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await PropertyTaxModel.storeOTP(mobile_number, otpCode);

        await SmsService.sendSMS(mobile_number, `Your OTP for Property Tax Verification (Aadhaar: ****${aadhaar_number.slice(-4)}) is ${otpCode}. Valid for 10 mins.`);

        res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Verify OTP for Property Tax service
 */
exports.verifyOTP = async (req, res, next) => {
    try {
        const { mobile_number, otp_code } = req.body;
        if (!mobile_number || !otp_code) {
            return res.status(400).json({ success: false, message: "Mobile and OTP are required" });
        }

        const isValid = await PropertyTaxModel.verifyOTP(mobile_number, otp_code);
        if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Submit a new Property Tax application (Registration)
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            mobile_number,
            email,
            district,
            taluka,
            village,
            property_id,
            property_type,
            property_area,
            registration_date,
            application_type
        } = req.body;

        if (!full_name || !aadhaar_number || !mobile_number || !district || !taluka || !village) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "PTAX" + Math.random().toString(36).substr(2, 8).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            mobile_number,
            email,
            property_id,
            property_type,
            property_area,
            district,
            taluka,
            village,
            tax_type: "REGISTRATION",
            amount: 0.00,
            payment_method: "WAITING",
            mobile_no_payment: mobile_number,
            registration_date,
            application_type,
            reference_id,
            aadhaar_card_url: normalizePath(files.aadhaar_card?.[0]?.path),
            tax_bill_url: normalizePath(files.tax_bill?.[0]?.path),
            index_ii_url: normalizePath(files.index_ii?.[0]?.path),
            posession_letter_url: normalizePath(files.posession_letter?.[0]?.path),
            photo_url: normalizePath(files.photo?.[0]?.path),
            other_doc_url: normalizePath(files.other_doc?.[0]?.path)
        };

        const applicationId = await PropertyTaxModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Property Tax application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Submit a Property Tax correction request
 */
exports.submitCorrection = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            property_id,
            aadhaar_number,
            mobile_number,
            correction_type,
            corrected_owner_name,
            corrected_property_area,
            corrected_property_type,
            other_details
        } = req.body;

        if (!property_id || !aadhaar_number || !mobile_number || !correction_type) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "CPTAX" + Math.random().toString(36).substr(2, 8).toUpperCase();
        const files = req.files || {};
        const normalizePath = (p) => p ? p.replace(/\\/g, '/').replace(/^.*[\/\\]src[\/\\]uploads[\/\\]/, '') : null;

        const correctionData = {
            user_id: userId,
            property_id,
            aadhaar_number,
            mobile_number,
            correction_type,
            corrected_owner_name,
            corrected_property_area,
            corrected_property_type,
            other_details,
            reference_id,
            id_proof_url: normalizePath((files.id_proof || files.aadhaar_card)?.[0]?.path),
            supporting_doc_url: normalizePath(files.supporting_doc?.[0]?.path),
            other_doc_url: normalizePath(files.other_doc?.[0]?.path)
        };

        const correctionId = await PropertyTaxModel.createCorrection(correctionData);

        res.status(201).json({
            success: true,
            message: "Property Tax correction request submitted successfully",
            data: { correctionId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Property Tax applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await PropertyTaxModel.getAll();
        } else {
            applications = await PropertyTaxModel.getByUserId(userId);
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
        const application = await PropertyTaxModel.getByReferenceId(referenceId);

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

        await PropertyTaxModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};
