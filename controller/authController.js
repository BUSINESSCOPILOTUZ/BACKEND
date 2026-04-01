const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secret_key, time } = require("../config/config");

/**
 * Google orqali kirish / Ro'yxatdan o'tish
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

module.exports = { googleAuth, getProfile, updateProfile };
