const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const domicileController = require("../controllers/domicile.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/certificates/domicile");
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

const domicileUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "ration_card", maxCount: 1 },
    { name: "birth_cert", maxCount: 1 },
    { name: "school_leaving", maxCount: 1 },
    { name: "residence_proof", maxCount: 1 },
    { name: "self_declaration", maxCount: 1 },
    { name: "photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", domicileUpload, domicileController.createApplication);
router.get("/list", domicileController.getApplications);
router.get("/:referenceId", domicileController.getApplicationByRef);
router.put("/update-status/:id", domicileController.updateStatus);

module.exports = router;
