const router = require("express").Router();
const passport = require("passport");
const {
  googleAuth,
  googleOAuthCallback,
  getProfile,
  updateProfile,
} = require("../controller/authController");
const { authMiddleware } = require("../middleware/auth");

// ============================================
// Google OAuth 2.0 Routes (Yangi — Passport.js)
// ============================================

/**
 * GET /api/auth/google
 *
 * Frontend "Google orqali kirish" tugmasini bosganda shu route'ga yo'naltiriladi.
 * Passport.js avtomatik ravishda Google'ning login sahifasiga redirect qiladi.
 *
 * scope: ["profile", "email"] — Google'dan ism, email va rasm ma'lumotlarini so'raydi
 * prompt: "select_account" — Har doim akkaunt tanlash oynasini ko'rsatadi
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Har doim akkaunt tanlash imkoniyati
  }),
);

/**
 * GET /api/auth/google/callback
 *
 * Google foydalanuvchini avtorizatsiya qilgandan keyin shu URL'ga qaytaradi.
 * Passport strategiyasi foydalanuvchini tekshiradi va `req.user` ga qo'yadi.
 *
 * Muvaffaqiyatli bo'lsa — googleOAuthCallback controller'ga o'tadi
 * Xato bo'lsa — frontendga xato parametri bilan redirect qiladi
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false, // Biz JWT ishlatamiz, session kerak emas
    failureRedirect: `${process.env.FRONTEND_URL || "https://business-copilot.masatov.uz"}?error=google_auth_failed`,
  }),
  googleOAuthCallback, // Muvaffaqiyatli bo'lganda — JWT yaratib frontendga redirect qiladi
);

// ============================================
// Eski Route'lar (saqlab qolindi)
// ============================================

// Google orqali kirish / ro'yxatdan o'tish (Firebase usuli — eski)
router.post("/google", googleAuth);

// Profil olish (auth kerak)
router.get("/me", authMiddleware, getProfile);

// Profilni yangilash (auth kerak)
router.put("/me", authMiddleware, updateProfile);

module.exports = router;
