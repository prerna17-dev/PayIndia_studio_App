const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const propertyTaxController = require("../controllers/property_tax.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/property_tax");
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

const propertyTaxUpload = upload.fields([
    { name: "aadhaar_card", maxCount: 1 },
    { name: "tax_bill", maxCount: 1 },
    { name: "index_ii", maxCount: 1 },
    { name: "posession_letter", maxCount: 1 },
    { name: "other_doc", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
    { name: "supporting_doc", maxCount: 1 },
    { name: "photo", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

// OTP routes
router.post("/otp/send", propertyTaxController.sendOTP);
router.post("/otp/verify", propertyTaxController.verifyOTP);

// Application routes
router.post("/apply-new", propertyTaxUpload, propertyTaxController.createApplication);
router.post("/submit-correction", propertyTaxUpload, propertyTaxController.submitCorrection);

router.get("/list", propertyTaxController.getApplications);
router.get("/:referenceId", propertyTaxController.getApplicationByRef);
router.put("/update-status/:id", propertyTaxController.updateStatus);

module.exports = router;
