const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agent.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get(
  "/dashboard",
  auth,
  role(["AGENT"]),
  agentController.getDashboard
);

module.exports = router;
