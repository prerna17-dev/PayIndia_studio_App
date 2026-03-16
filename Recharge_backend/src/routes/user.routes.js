const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/user.controller");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/uploads/");
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

router.get("/profile", auth, controller.getProfile);
router.put("/profile", auth, upload.single("profile_image"), controller.updateProfile);
router.get("/transactions", auth, controller.getTransactions);

module.exports = router;
