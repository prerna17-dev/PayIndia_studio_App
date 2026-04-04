const express = require("express");
const router = express.Router();
const financeController = require("../controllers/finance.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/:year/:month", auth, financeController.getFinanceData);
router.post("/update", auth, financeController.updateFinanceData);

module.exports = router;
