const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/balance", auth, walletController.getBalance);
router.post("/add", auth, walletController.addMoney);
router.post("/withdraw", auth, walletController.withdrawMoney);
router.get("/transactions", auth, walletController.getTransactions);

module.exports = router;
