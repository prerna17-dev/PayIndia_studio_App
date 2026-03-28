const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pmKisanController = require("../controllers/pm_kisan.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/pm_kisan");
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

const pmKisanUpload = upload.fields([
    { name: "land_712", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
]);

// All routes require authentication
router.post("/status", pmKisanController.checkStatus);

router.use(authMiddleware);

router.post("/apply", pmKisanUpload, pmKisanController.createApplication);
router.post("/otp/send", pmKisanController.sendOtp);
router.post("/otp/verify", pmKisanController.verifyOtp);
router.post("/correction", upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "bank", maxCount: 1 },
    { name: "land", maxCount: 1 },
    { name: "mobile", maxCount: 1 },
]), pmKisanController.submitCorrection);
router.get("/list", pmKisanController.getApplications);
router.get("/:referenceId", pmKisanController.getApplicationByRef);
router.put("/update-status/:id", pmKisanController.updateStatus);

module.exports = router;
