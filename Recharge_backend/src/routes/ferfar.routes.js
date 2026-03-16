const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ferfarController = require("../controllers/ferfar.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/ferfar");
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

const ferfarUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "index_2", maxCount: 1 },
    { name: "death_cert", maxCount: 1 },
    { name: "ferfar_cert", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", ferfarUpload, ferfarController.createApplication);
router.get("/list", ferfarController.getApplications);
router.get("/:referenceId", ferfarController.getApplicationByRef);
router.put("/update-status/:id", ferfarController.updateStatus);

module.exports = router;
