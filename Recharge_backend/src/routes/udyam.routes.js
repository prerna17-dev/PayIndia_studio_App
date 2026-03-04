const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const udyamController = require("../controllers/udyam.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/udyam");
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

const udyamUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", udyamUpload, udyamController.createApplication);
router.get("/list", udyamController.getApplications);
router.get("/:referenceId", udyamController.getApplicationByRef);
router.put("/update-status/:id", udyamController.updateStatus);

module.exports = router;
