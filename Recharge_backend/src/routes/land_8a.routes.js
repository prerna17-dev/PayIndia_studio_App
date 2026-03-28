const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const land8aController = require("../controllers/land_8a.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/land_8a");
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

const land8aUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "ownership_proof", maxCount: 1 },
    { name: "property_details_doc", maxCount: 1 },
    { name: "previous_8a", maxCount: 1 },
    { name: "previous8_a", maxCount: 1 },
    { name: "mutation_record", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
    { name: "supporting_doc", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/send-otp", land8aController.sendOTP);
router.post("/verify-otp", land8aController.verifyOTP);
router.post("/apply", land8aUpload, land8aController.createApplication);
router.post("/correction/submit", land8aUpload, land8aController.submitCorrection);
router.get("/list", land8aController.getApplications);
router.get("/:referenceId", land8aController.getApplicationByRef);
router.put("/update-status/:id", land8aController.updateStatus);

module.exports = router;
