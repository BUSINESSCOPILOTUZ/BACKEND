const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism kiritish shart"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email kiritish shart"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Google OAuth orqali kirgan foydalanuvchilar uchun
    googleId: {
      type: String,
      unique: true,
      sparse: true, // null bo'lishi mumkin (demo yoki boshqa usulda kirganlar uchun)
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
    phone: {
      type: String,
      default: "",
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

module.exports = mongoose.model("User", UserSchema);
