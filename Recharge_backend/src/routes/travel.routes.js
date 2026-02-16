const express = require("express");
const router = express.Router();
const travelController = require("../controllers/travel.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/bus/search", auth, travelController.searchBus);

module.exports = router;
