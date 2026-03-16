const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const rationCardController = require("../controllers/ration_card.controller");
const auth = require("../middlewares/auth.middleware");

// Multer config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/uploads/ration_card/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
router.post(
    "/apply",
    auth,
    upload.fields([
        { name: "address_proof", maxCount: 1 },
        { name: "income_cert", maxCount: 1 },
        { name: "head_id", maxCount: 1 }
    ]),
    rationCardController.createApplication
);

router.get("/my-applications", auth, rationCardController.getMyApplications);
router.get("/:id", auth, rationCardController.getApplicationDetails);

module.exports = router;
