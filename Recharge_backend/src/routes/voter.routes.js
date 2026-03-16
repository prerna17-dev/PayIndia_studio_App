const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const voterController = require("../controllers/voter.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration for Voter documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/voter");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

const voterUpload = upload.fields([
    { name: "aadhar_card", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "dob_proof", maxCount: 1 },
    { name: "passport_photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

// User: Submit application with documents
router.post("/apply", voterUpload, voterController.createApplication);

// User/Admin/Agent: List applications
router.get("/list", voterController.getApplications);

// Get specific application by ID
router.get("/:applicationId", voterController.getApplicationById);

// Admin: Update status (Approve/Reject)
router.put("/update-status/:applicationId", voterController.updateStatus);

// Agent/Admin: Process application
router.put("/process/:applicationId", voterController.processApplication);

/* --- VOTER CORRECTION ROUTES --- */

const correctionStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/voter_corrections");
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

const voterCorrectionUpload = uploadCorrection.fields([
    { name: "identity_proof", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "dob_proof", maxCount: 1 },
    { name: "photo", maxCount: 1 },
]);

// User: Send and Verify OTP for Correction
router.post("/correction/send-otp", voterController.sendCorrectionOTP);
router.post("/correction/verify-otp", voterController.verifyCorrectionOTP);

// User: Submit correction with documents
router.post("/correction/submit", voterCorrectionUpload, voterController.submitCorrection);

// Admin/Agent: List corrections
router.get("/correction/list", voterController.getCorrections);

module.exports = router;
