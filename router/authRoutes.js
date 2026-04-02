const router = require("express").Router();
const {
  register,
  login,
  sendOTPHandler,
  verifyOTP,
  getProfile,
  updateProfile,
} = require("../controller/authController");
const { authMiddleware } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

// ============================================
// Ochiq route'lar (auth kerak emas) — rate-limited
// ============================================

// Email + Parol orqali ro'yxatdan o'tish
router.post("/register", authLimiter, register);

// Email + Parol orqali kirish
router.post("/login", authLimiter, login);

// Telefon raqamiga OTP kod yuborish
router.post("/send-otp", authLimiter, sendOTPHandler);

// OTP kodni tekshirish va tizimga kirish
router.post("/verify-otp", authLimiter, verifyOTP);

// ============================================
// Himoyalangan route'lar (auth kerak)
// ============================================

// Profil olish
router.get("/me", authMiddleware, getProfile);

// Profilni yangilash
router.put("/me", authMiddleware, updateProfile);

module.exports = router;
