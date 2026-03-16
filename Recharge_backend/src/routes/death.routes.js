const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const deathController = require("../controllers/death.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/certificates/death");
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

const deathUpload = upload.fields([
    { name: "death_report", maxCount: 1 },
    { name: "deceased_aadhaar", maxCount: 1 },
    { name: "applicant_aadhaar", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", deathUpload, deathController.createApplication);
router.get("/list", deathController.getApplications);
router.get("/:referenceId", deathController.getApplicationByRef);
router.put("/update-status/:id", deathController.updateStatus);

module.exports = router;
