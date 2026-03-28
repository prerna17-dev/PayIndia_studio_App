const expressway = require("express");
const router = expressway.Router();
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
    { name: "aadhaarCard", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
    { name: "legalDoc", maxCount: 1 },
    { name: "mutation_doc", maxCount: 1 },
    { name: "prev712", maxCount: 1 },
    { name: "ownership_doc", maxCount: 1 },
    { name: "saleDeed", maxCount: 1 },
    { name: "application_form", maxCount: 1 },
    { name: "prev8A", maxCount: 1 },
    { name: "supporting_doc", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "otherDoc", maxCount: 1 },
]);

// All routes require authentication
router.use(authMiddleware);

router.post("/send-otp", ferfarController.sendOTP);
router.post("/verify-otp", ferfarController.verifyOTP);
router.post("/apply", ferfarUpload, ferfarController.createApplication);
router.post("/correction/submit", ferfarUpload, ferfarController.submitCorrection);
router.get("/list", ferfarController.getApplications);
router.get("/:referenceId", ferfarController.getApplicationByRef);
router.put("/update-status/:id", ferfarController.updateStatus);

module.exports = router;
