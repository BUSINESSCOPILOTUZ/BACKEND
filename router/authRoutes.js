const router = require("express").Router();
const {
  googleAuth,
  getProfile,
  updateProfile,
} = require("../controller/authController");
const { authMiddleware } = require("../middleware/auth");

// Google orqali kirish / ro'yxatdan o'tish
router.post("/google", googleAuth);

// Profil olish (auth kerak)
router.get("/me", authMiddleware, getProfile);

// Profilni yangilash (auth kerak)
router.put("/me", authMiddleware, updateProfile);

module.exports = router;
