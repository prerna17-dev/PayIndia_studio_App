const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/user.controller");

router.get("/profile", auth, controller.getProfile);
router.put("/profile", auth, controller.updateProfile);

module.exports = router;
