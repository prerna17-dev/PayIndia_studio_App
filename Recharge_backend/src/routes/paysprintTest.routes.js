const router = require("express").Router();
const controller = require("../controllers/paysprintTest.controller");

router.get("/test-paysprint", controller.testPaySprint);
router.post("/test-dorecharge", controller.testDoRecharge);
router.post("/test-status", controller.testRechargeStatus);
module.exports = router;
