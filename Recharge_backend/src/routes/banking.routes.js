const express = require("express");
const router = express.Router();
const bankingController = require("../controllers/banking.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/add-account", auth, bankingController.addBankAccount);
router.get("/accounts", auth, bankingController.getMyAccounts);
router.delete("/remove-account", auth, bankingController.removeBankAccount);
router.post("/verify-account", auth, bankingController.verifyAccount);
router.post("/verify-otp", auth, bankingController.verifyBankOtp);
router.post("/seed-banks", auth, bankingController.seedBanks); // New route to seed banks
router.get("/bank-list", auth, bankingController.getBanks); // New route to get bank list

module.exports = router;