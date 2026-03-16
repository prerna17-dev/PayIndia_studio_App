const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const birthController = require("../controllers/birth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/certificates/birth");
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

const birthUpload = upload.fields([
    { name: "hospital_report", maxCount: 1 },
    { name: "parents_aadhaar", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "marriage_certificate", maxCount: 1 },
    { name: "affidavit", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", birthUpload, birthController.createApplication);
router.get("/list", birthController.getApplications);
router.get("/:referenceId", birthController.getApplicationByRef);
router.put("/update-status/:id", birthController.updateStatus);

module.exports = router;
