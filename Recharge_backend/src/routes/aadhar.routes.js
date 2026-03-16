const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const aadharController = require("../controllers/aadhar.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration for Aadhaar documents
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/aadhar");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const aadharUpload = upload.fields([
    { name: "birth_certificate", maxCount: 1 },
    { name: "school_certificate", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "parent_aadhaar", maxCount: 1 },
]);

const aadharCorrectionUpload = upload.fields([
    { name: "identity_proof", maxCount: 1 },
    { name: "identity_proof_2", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "address_proof_2", maxCount: 1 },
    { name: "dob_proof", maxCount: 1 },
    { name: "photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

// User: Submit enrollment with documents
router.post("/enroll", aadharUpload, aadharController.createEnrollment);

// User: Aadhaar Correction
router.post("/correction/send-otp", aadharController.sendCorrectionOTP);
router.post("/correction/verify-otp", aadharController.verifyCorrectionOTP);
router.post("/correction/submit", aadharCorrectionUpload, aadharController.submitCorrection);

// User/Admin/Agent: List enrollments
router.get("/list", aadharController.getEnrollments);

// Admin/Agent: List corrections
router.get("/corrections", aadharController.getCorrections);

// Admin: Update status (Approve/Reject)
router.put("/update-status/:enrollmentId", aadharController.updateStatus);

// Agent/Admin: Process enrollment
router.put("/process/:enrollmentId", aadharController.processEnrollment);

module.exports = router;
