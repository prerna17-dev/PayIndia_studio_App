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
    { name: "holding_document", maxCount: 1 },
    { name: "photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", land8aUpload, land8aController.createApplication);
router.get("/list", land8aController.getApplications);
router.get("/:referenceId", land8aController.getApplicationByRef);
router.put("/update-status/:id", land8aController.updateStatus);

module.exports = router;
