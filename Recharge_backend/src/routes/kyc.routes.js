const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const kycController = require('../controllers/kyc.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Set up Multer for KYC document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads/kyc/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `kyc-${req.user.userId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/upload', authMiddleware, upload.single('document_image'), kycController.uploadKYCDocument);
router.get('/status', authMiddleware, kycController.getAllKYCStatus);
router.get('/status/:document_type', authMiddleware, kycController.getKYCStatus);

module.exports = router;
