const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const seniorCitizenController = require("../controllers/senior_citizen.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/senior_citizen");
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

const seniorCitizenUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "age_proof", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "supporting_doc", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", seniorCitizenUpload, seniorCitizenController.createApplication);
router.post("/otp/send", seniorCitizenController.sendOtp);
router.post("/otp/verify", seniorCitizenController.verifyOtp);
router.post("/apply/otp/send", seniorCitizenController.sendApplyOtp);
router.post("/apply/otp/verify", seniorCitizenController.verifyApplyOtp);
router.post("/correction", seniorCitizenUpload, seniorCitizenController.submitCorrection);
router.get("/list", seniorCitizenController.getApplications);
router.get("/:referenceId", seniorCitizenController.getApplicationByRef);
router.put("/update-status/:id", seniorCitizenController.updateStatus);

module.exports = router;
