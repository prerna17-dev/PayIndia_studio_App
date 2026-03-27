const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const panController = require("../controllers/pan.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration for PAN documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/pan");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit as per UI
});

// Define the fields for document uploads
const panUpload = upload.fields([
    { name: "aadhar_card", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "dob_proof", maxCount: 1 },
    { name: "passport_photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

// User: Send and Verify OTP for New Application
router.post("/apply/send-otp", panController.sendApplyOTP);
router.post("/apply/verify-otp", panController.verifyApplyOTP);

// User: Submit application with documents
router.post("/apply", panUpload, panController.createApplication);

// User/Admin/Agent: List applications
router.get("/list", panController.getApplications);

// Get specific application by ID
router.get("/:applicationId", panController.getApplicationById);

// Admin: Update status (Approve/Reject)
router.put("/update-status/:applicationId", panController.updateStatus);

// Agent/Admin: Process application
router.put("/process/:applicationId", panController.processApplication);

/* --- PAN CORRECTION ROUTES --- */

const correctionStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/pan_corrections");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const uploadCorrection = multer({
    storage: correctionStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const panCorrectionUpload = uploadCorrection.fields([
    { name: "proof_of_name", maxCount: 1 },
    { name: "identity_proof", maxCount: 1 },
    { name: "proof_of_dob", maxCount: 1 },
    { name: "photo_sign", maxCount: 1 },
    { name: "father_proof", maxCount: 1 },
    { name: "father_declare", maxCount: 1 },
    { name: "contact_proof", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "address_id", maxCount: 1 },
    { name: "photo_passport", maxCount: 1 },
    { name: "photo_id", maxCount: 1 },
]);

// User: Send and Verify OTP for Correction
router.post("/correction/send-otp", panController.sendCorrectionOTP);
router.post("/correction/verify-otp", panController.verifyCorrectionOTP);

// User: Submit correction with documents
router.post("/correction/submit", panCorrectionUpload, panController.submitCorrection);

// Admin/Agent: List corrections
router.get("/correction/list", panController.getCorrections);

module.exports = router;
