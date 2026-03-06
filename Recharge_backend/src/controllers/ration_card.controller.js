const RationCard = require("../models/ration_card.model");
const { formatDateToMySQL } = require("../utils/date.helper");

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
