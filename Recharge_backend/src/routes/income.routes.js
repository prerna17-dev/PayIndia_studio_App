const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const incomeController = require("../controllers/income.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/certificates/income");
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

const incomeUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "ration_card", maxCount: 1 },
    { name: "tax_receipt", maxCount: 1 },
    { name: "income_proof", maxCount: 1 },
    { name: "self_declaration", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "other_docs", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", incomeUpload, incomeController.createApplication);
router.get("/list", incomeController.getApplications);
router.get("/:referenceId", incomeController.getApplicationByRef);
router.put("/update-status/:id", incomeController.updateStatus);

module.exports = router;
