const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const nclController = require("../controllers/ncl.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/certificates/ncl");
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

const nclUpload = upload.fields([
    { name: "id_proof", maxCount: 1 },
    { name: "address_proof", maxCount: 1 },
    { name: "caste_cert", maxCount: 1 },
    { name: "income_proof_year1", maxCount: 1 },
    { name: "income_proof_year2", maxCount: 1 },
    { name: "income_proof_year3", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "school_leaving", maxCount: 1 },
    { name: "caste_affidavit", maxCount: 1 },
    { name: "marriage_cert", maxCount: 1 },
    { name: "pre_marriage_caste", maxCount: 1 },
    { name: "gazette_copy", maxCount: 1 },
    { name: "father_caste_cert", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/apply", nclUpload, nclController.createApplication);
router.get("/list", nclController.getApplications);
router.get("/:referenceId", nclController.getApplicationByRef);
router.put("/update-status/:id", nclController.updateStatus);

module.exports = router;
