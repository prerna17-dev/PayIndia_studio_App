const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ayushmanController = require("../controllers/ayushman.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/ayushman");
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

const ayushmanUpload = upload.fields([
    { name: "aadhaar_head", maxCount: 1 },
    { name: "ration_card", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "secc_proof", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", ayushmanUpload, ayushmanController.createApplication);
router.get("/list", ayushmanController.getApplications);
router.get("/:referenceId", ayushmanController.getApplicationByRef);
router.put("/update-status/:id", ayushmanController.updateStatus);

module.exports = router;
