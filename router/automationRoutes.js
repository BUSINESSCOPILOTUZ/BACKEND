const router = require("express").Router();
const {
  getSettings,
  updateSettings,
} = require("../controller/automationController");
const { authMiddleware } = require("../middleware/auth");

// Barcha routelar auth talab qiladi
router.use(authMiddleware);

// Avtomatizatsiya sozlamalarini olish
router.get("/", getSettings);

// Avtomatizatsiya sozlamalarini yangilash
router.put("/", updateSettings);

module.exports = router;
