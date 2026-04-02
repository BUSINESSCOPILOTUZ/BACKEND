const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secret_key, time } = require("../config/config");
const { sendOTP } = require("../services/smsService");

// ============================================
// Yordamchi funksiya: JWT token yaratish
// ============================================
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, phone: user.phone, role: user.role },
    secret_key,
    { expiresIn: time },
  );
};

// Foydalanuvchi ma'lumotlarini xavfsiz formatda qaytarish (parol va OTP ni chiqarmaslik)
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email || "",
  phone: user.phone || "",
  role: user.role,
  photoURL: user.photoURL || "",
  phoneVerified: user.phoneVerified || false,
});

// ============================================
// 1. EMAIL + PAROL ORQALI RO'YXATDAN O'TISH
// POST /api/auth/register
// ============================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validatsiya
    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Ism, email va parol kiritish shart.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
      });
    }

    // Email allaqachon mavjudmi tekshirish
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "Bu email allaqachon ro'yxatdan o'tgan. Tizimga kiring.",
      });
    }

    // Yangi foydalanuvchi yaratish (parol avtomatik hash bo'ladi — User model pre-save hook)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "user",
    });

    // JWT token yaratish
    const token = generateToken(user);

    res.status(201).json({
      status: true,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
      data: { token, user: sanitizeUser(user) },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Ro'yxatdan o'tishda xatolik: " + error.message,
    });
  }
};

// ============================================
// 2. EMAIL + PAROL ORQALI KIRISH
// POST /api/auth/login
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validatsiya
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email va parolni kiriting.",
      });
    }

    // Foydalanuvchini topish (parol fieldini ham olish kerak)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Email yoki parol noto'g'ri.",
      });
    }

    // Agar foydalanuvchi parol o'rnatmagan bo'lsa (masalan, faqat telefon bilan kirgan)
    if (!user.password) {
      return res.status(401).json({
        status: false,
        message:
          "Bu email uchun parol o'rnatilmagan. Telefon orqali kiring yoki ro'yxatdan o'ting.",
      });
    }

    // Parolni tekshirish
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Email yoki parol noto'g'ri.",
      });
    }

    // Hisobi faolmi tekshirish
    if (!user.isActive) {
      return res.status(403).json({
        status: false,
        message: "Sizning hisobingiz bloklangan.",
      });
    }

    // Oxirgi kirish vaqtini yangilash
    user.lastLogin = new Date();
    await user.save();

    // JWT token yaratish
    const token = generateToken(user);

    res.status(200).json({
      status: true,
      message: "Muvaffaqiyatli kirdingiz!",
      data: { token, user: sanitizeUser(user) },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Tizimga kirishda xatolik: " + error.message,
    });
  }
};

// ============================================
// 3. TELEFON RAQAMIGA OTP KOD YUBORISH
// POST /api/auth/send-otp
// ============================================
const sendOTPHandler = async (req, res) => {
  try {
    let { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        status: false,
        message: "Telefon raqamini kiriting.",
      });
    }

    // Telefon raqamini tozalash va formatlash (998XXXXXXXXX formatga keltirish)
    phone = phone.replace(/\D/g, ""); // Faqat raqamlarni qoldirish
    if (phone.startsWith("+")) phone = phone.slice(1);
    if (!phone.startsWith("998")) phone = "998" + phone;

    // Telefon raqami to'g'riligini tekshirish (O'zbekiston: 998 + 9 raqam = 12 ta raqam)
    if (phone.length !== 12) {
      return res.status(400).json({
        status: false,
        message: "Noto'g'ri telefon raqami formati. Masalan: 998901234567",
      });
    }

    // OTP generatsiya qilish va SMS yuborish (Eskiz API)
    const { otp, expiresAt } = await sendOTP(phone);

    // OTP ni bazada saqlash (foydalanuvchi mavjud bo'lsa yangilash, bo'lmasa yaratish)
    let user = await User.findOne({ phone });

    if (!user) {
      // Yangi foydalanuvchi yaratish (telefon bilan birinchi marta kirmoqda)
      user = await User.create({
        name: "Foydalanuvchi",
        phone,
        otpCode: otp,
        otpExpires: expiresAt,
        role: "user",
      });
    } else {
      // Mavjud foydalanuvchining OTP sini yangilash
      user.otpCode = otp;
      user.otpExpires = expiresAt;
      await user.save();
    }

    console.log(`📱 OTP yuborildi: ${phone} → ${otp}`); // Development uchun log

    res.status(200).json({
      status: true,
      message: "Tasdiqlash kodi yuborildi!",
      data: {
        phone,
        expiresIn: "5 daqiqa",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "OTP yuborishda xatolik: " + error.message,
    });
  }
};

// ============================================
// 4. OTP KODNI TEKSHIRISH VA TIZIMGA KIRISH
// POST /api/auth/verify-otp
// ============================================
const verifyOTP = async (req, res) => {
  try {
    let { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        status: false,
        message: "Telefon raqami va tasdiqlash kodini kiriting.",
      });
    }

    // Telefon raqamini tozalash
    phone = phone.replace(/\D/g, "");
    if (!phone.startsWith("998")) phone = "998" + phone;

    // Foydalanuvchini topish
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "Bu telefon raqami ro'yxatdan o'tmagan. Avval OTP so'rang.",
      });
    }

    // OTP kodini tekshirish
    if (user.otpCode !== code) {
      return res.status(401).json({
        status: false,
        message: "Noto'g'ri tasdiqlash kodi.",
      });
    }

    // OTP muddati tugagan-tugamaganini tekshirish
    if (!user.otpExpires || new Date() > user.otpExpires) {
      return res.status(401).json({
        status: false,
        message: "Tasdiqlash kodi muddati tugagan. Qaytadan so'rang.",
      });
    }

    // Hisobi faolmi tekshirish
    if (!user.isActive) {
      return res.status(403).json({
        status: false,
        message: "Sizning hisobingiz bloklangan.",
      });
    }

    // OTP tasdiqlandi — tozalash va foydalanuvchini yangilash
    user.otpCode = null;
    user.otpExpires = null;
    user.phoneVerified = true;
    user.lastLogin = new Date();
    await user.save();

    // JWT token yaratish
    const token = generateToken(user);

    res.status(200).json({
      status: true,
      message: "Muvaffaqiyatli kirdingiz!",
      data: { token, user: sanitizeUser(user) },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "OTP tekshirishda xatolik: " + error.message,
    });
  }
};

// ============================================
// PROFIL
// ============================================

/**
 * Profil olish
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otpCode -otpExpires -__v",
    );

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
    ).select("-password -otpCode -otpExpires -__v");

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

module.exports = {
  register,
  login,
  sendOTPHandler,
  verifyOTP,
  getProfile,
  updateProfile,
};
