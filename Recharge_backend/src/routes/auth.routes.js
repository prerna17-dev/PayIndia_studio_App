const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { sendOtpSchema, verifyOtpSchema } = require("../validations/auth.validation");
const auth = require("../middlewares/auth.middleware");

router.post("/send-otp", (req, res, next) => {
  const { error } = sendOtpSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
}, authController.sendOTP);


router.post("/verify-otp", authController.verifyOTP);
router.post("/logout", auth, authController.logout);

module.exports = router;
