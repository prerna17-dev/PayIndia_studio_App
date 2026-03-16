const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const land712Controller = require("../controllers/land_712.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/land_712");
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

const land712Upload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "land_document", maxCount: 1 },
    { name: "photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", land712Upload, land712Controller.createApplication);
router.get("/list", land712Controller.getApplications);
router.get("/:referenceId", land712Controller.getApplicationByRef);
router.put("/update-status/:id", land712Controller.updateStatus);

module.exports = router;
