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

// ============================================
// Ochiq route'lar (auth kerak emas)
// ============================================

// Email + Parol orqali ro'yxatdan o'tish
router.post("/register", register);

// Email + Parol orqali kirish
router.post("/login", login);

// Telefon raqamiga OTP kod yuborish
router.post("/send-otp", sendOTPHandler);

// OTP kodni tekshirish va tizimga kirish
router.post("/verify-otp", verifyOTP);

// ============================================
// Himoyalangan route'lar (auth kerak)
// ============================================

// Profil olish
router.get("/me", authMiddleware, getProfile);

// Profilni yangilash
router.put("/me", authMiddleware, updateProfile);

module.exports = router;
