const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get(
  "/transactions",
  auth,
  role(["ADMIN"]),
  reportController.transactionReport
);

module.exports = router;
