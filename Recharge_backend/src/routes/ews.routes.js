const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ewsController = require("../controllers/ews.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/certificates/ews");
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

const ewsUpload = upload.fields([
    { name: "income_cert", maxCount: 1 },
    { name: "proof_of_income", maxCount: 10 }, // Multiple
    { name: "property_docs", maxCount: 10 }, // Multiple
    { name: "id_proof", maxCount: 1 },
    { name: "residence_proof", maxCount: 1 },
    { name: "self_declaration", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "caste_cert", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", ewsUpload, ewsController.createApplication);
router.get("/list", ewsController.getApplications);
router.get("/:referenceId", ewsController.getApplicationByRef);
router.put("/update-status/:id", ewsController.updateStatus);

// OTP Routes
router.post("/send-otp", ewsController.sendOTP);
router.post("/verify-otp", ewsController.verifyOTP);

module.exports = router;
