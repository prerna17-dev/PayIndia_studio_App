const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get(
  "/stats",
  auth,
  role(["ADMIN"]),
  adminController.getStats
);

module.exports = router;
