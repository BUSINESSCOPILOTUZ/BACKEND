const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secret_key, time } = require("../config/config");

/**
 * Google orqali kirish / Ro'yxatdan o'tish (eski Firebase usuli — saqlab qolindi)
 * POST /api/auth/google
 */
const googleAuth = async (req, res) => {
  try {
    const { name, email, firebaseUid, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email kiritish shart.",
      });
    }

    // Foydalanuvchini topish yoki yaratish
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        firebaseUid: firebaseUid || "",
        photoURL: photoURL || "",
        role: "user",
      });
    } else {
      // Mavjud foydalanuvchini yangilash
      user.lastLogin = new Date();
      if (firebaseUid) user.firebaseUid = firebaseUid;
      if (photoURL) user.photoURL = photoURL;
      if (name) user.name = name;
      await user.save();
    }

    // JWT token yaratish
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret_key,
      { expiresIn: time },
    );

    res.status(200).json({
      status: true,
      message: "Muvaffaqiyatli kirildi",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          photoURL: user.photoURL,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Tizimga kirishda xatolik: " + error.message,
    });
  }
};

/**
 * Google OAuth 2.0 Callback — Passport muvaffaqiyatli autorizatsiya qilgandan keyin chaqiriladi
 * GET /api/auth/google/callback
 *
 * Bu yerda:
 *   1. Passport orqali kelgan user obyektidan JWT token yaratamiz
 *   2. Tokenni URL query parametr sifatida frontendga jo'natamiz
 *   3. Frontend bu tokenni URL'dan oladi va localStorage'ga saqlaydi
 */
const googleOAuthCallback = async (req, res) => {
  try {
    const user = req.user; // Passport strategiyasidan keladi

    if (!user) {
      // Agar foydalanuvchi topilmasa — frontendga xato bilan qaytarish
      const frontendURL =
        process.env.FRONTEND_URL || "https://business-copilot.masatov.uz";
      return res.redirect(`${frontendURL}/login?error=auth_failed`);
    }

    // JWT token yaratish — frontend buni saqlaydi
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secret_key,
      { expiresIn: time },
    );

    // Foydalanuvchi ma'lumotlarini URL-safe qilib encode qilish
    const userData = encodeURIComponent(
      JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
      }),
    );

    // Frontend URL'ga token va user ma'lumotlarini query parametr sifatida jo'natish
    const frontendURL =
      process.env.FRONTEND_URL || "https://business-copilot.masatov.uz";
    res.redirect(`${frontendURL}?token=${token}&user=${userData}`);
  } catch (error) {
    console.error("❌ Google OAuth callback xatosi:", error);
    const frontendURL =
      process.env.FRONTEND_URL || "https://business-copilot.masatov.uz";
    res.redirect(`${frontendURL}/login?error=server_error`);
  }
};

/**
 * Profil olish
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");

    res.status(200).json({
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Profilni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Profilni yangilash
 * PUT /api/auth/me
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true },
    ).select("-__v");

    res.status(200).json({
      status: true,
      message: "Profil yangilandi",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Profilni yangilashda xatolik: " + error.message,
    });
  }
};

module.exports = { googleAuth, googleOAuthCallback, getProfile, updateProfile };
