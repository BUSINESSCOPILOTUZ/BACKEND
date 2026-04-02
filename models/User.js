const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism kiritish shart"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true, // email yoki phone dan biri bo'lishi mumkin
    },
    // Parol — bcrypt bilan hash qilinadi (email+parol orqali kiruvchilar uchun)
    password: {
      type: String,
      minlength: [6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"],
    },
    // Telefon raqami — OTP orqali kiruvchilar uchun
    phone: {
      type: String,
      unique: true,
      sparse: true, // null bo'lishi mumkin (email bilan kirganlar uchun)
      trim: true,
    },
    // Telefon tasdiqlangan yoki yo'q
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    // Bir martalik tasdiqlash kodi (OTP)
    otpCode: {
      type: String,
      default: null,
    },
    // OTP amal qilish muddati (5 daqiqa)
    otpExpires: {
      type: Date,
      default: null,
    },
    // Google OAuth orqali kirgan foydalanuvchilar uchun (eski — saqlab qolindi)
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    photoURL: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "manager", "influencer", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Parolni saqlashdan oldin avtomatik hash qilish
 * Faqat parol o'zgargan yoki yangi bo'lganda ishlaydi
 */
UserSchema.pre("save", async function (next) {
  // Agar parol o'zgarmagan bo'lsa — o'tkazib yuborish
  if (!this.isModified("password")) return next();
  // Agar parol bo'sh bo'lsa (telefon orqali kirganlar) — o'tkazib yuborish
  if (!this.password) return next();
  // Parolni 12 rounds bilan hash qilish
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Kiritilgan parolni bazadagi hash bilan solishtirish
 * @param {string} candidatePassword — Foydalanuvchi kiritgan parol
 * @returns {boolean} Parol to'g'ri yoki noto'g'ri
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
