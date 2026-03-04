const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const employmentController = require("../controllers/employment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/employment");
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

const employmentUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "education_cert", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "experience_cert", maxCount: 1 },
    { name: "caste_cert", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", employmentUpload, employmentController.createApplication);
router.get("/list", employmentController.getApplications);
router.get("/:referenceId", employmentController.getApplicationByRef);
router.put("/update-status/:id", employmentController.updateStatus);

module.exports = router;
