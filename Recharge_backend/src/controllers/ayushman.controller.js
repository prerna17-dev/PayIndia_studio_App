const AyushmanModel = require("../models/ayushman.model");

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
            dob,
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
