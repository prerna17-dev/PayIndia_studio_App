const express = require("express");
const router = express.Router();
const rechargeController = require("../controllers/recharge.controller");
const auth = require("../middlewares/auth.middleware");

// Fetch operator list from PaySprint
router.post("/operators", auth, rechargeController.getOperators);

// Do mobile recharge via PaySprint
router.post("/mobile", auth, rechargeController.mobileRecharge);

// Check recharge status from PaySprint
router.post("/status", auth, rechargeController.statusEnquiry);

// Seed operators from PaySprint
router.post("/seed-operators", auth, rechargeController.seedOperators);

module.exports = router;
