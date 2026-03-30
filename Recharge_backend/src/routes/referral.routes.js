const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/referral.controller");

// Route to get referral statistics and history for the authenticated user
router.get("/info", auth, controller.getReferralsInfo);

module.exports = router;
