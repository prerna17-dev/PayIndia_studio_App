const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const marriageController = require("../controllers/marriage.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/certificates/marriage");
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

const marriageUpload = upload.fields([
    { name: "groom_aadhaar", maxCount: 1 },
    { name: "bride_aadhaar", maxCount: 1 },
    { name: "invitation_card", maxCount: 1 },
    { name: "venue_proof", maxCount: 1 },
    { name: "marriage_photos", maxCount: 1 },
    { name: "w1_aadhaar", maxCount: 1 },
    { name: "w2_aadhaar", maxCount: 1 },
    { name: "w1_photo", maxCount: 1 },
    { name: "w2_photo", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", marriageUpload, marriageController.createApplication);
router.get("/list", marriageController.getApplications);
router.get("/:referenceId", marriageController.getApplicationByRef);
router.put("/update-status/:id", marriageController.updateStatus);

module.exports = router;
