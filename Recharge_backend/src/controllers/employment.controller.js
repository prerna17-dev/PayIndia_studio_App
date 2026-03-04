const EmploymentModel = require("../models/employment.model");

/**
 * Submit a new Employment Registration application
 */
exports.createApplication = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            full_name,
            aadhaar_number,
            dob,
            gender,
            category,
            mobile_number,
            email,
            house_no,
            area,
            village,
            taluka,
            district,
            pincode,
            employment_status,
            experience_years,
            qualification,
            computer_skills,
            languages,
            pref_sector
        } = req.body;

        if (!full_name || !aadhaar_number || !dob || !mobile_number || !employment_status || !qualification || !pref_sector) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        const reference_id = "EMP" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const files = req.files || {};
        const getFilePath = (fieldName) => files[fieldName] ? files[fieldName][0].path : null;

        const applicationData = {
            user_id: userId,
            full_name,
            aadhaar_number,
            dob,
            gender,
            category,
            mobile_number,
            email,
            house_no,
            area,
            village,
            taluka,
            district,
            pincode,
            employment_status,
            experience_years: experience_years || 0,
            qualification,
            computer_skills,
            languages,
            pref_sector,
            reference_id,
            aadhaar_card_url: getFilePath('aadhaar_card'),
            education_cert_url: getFilePath('education_cert'),
            photo_url: getFilePath('photo'),
            experience_cert_url: getFilePath('experience_cert'),
            caste_cert_url: getFilePath('caste_cert')
        };

        const applicationId = await EmploymentModel.create(applicationData);

        res.status(201).json({
            success: true,
            message: "Employment Registration application submitted successfully",
            data: { applicationId, reference_id },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get Employment Registration applications
 */
exports.getApplications = async (req, res, next) => {
    try {
        const { userId, role } = req.user;
        let applications;

        if (role === "ADMIN" || role === "AGENT") {
            applications = await EmploymentModel.getAll();
        } else {
            applications = await EmploymentModel.getByUserId(userId);
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
        const application = await EmploymentModel.getByReferenceId(referenceId);

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

        await EmploymentModel.updateStatus(id, status);

        res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (err) {
        next(err);
    }
};
