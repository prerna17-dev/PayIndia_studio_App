const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/balance", auth, walletController.getBalance);

module.exports = router;
