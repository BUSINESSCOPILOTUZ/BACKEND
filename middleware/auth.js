const jwt = require("jsonwebtoken");
const { secret_key } = require("../config/config");
const User = require("../models/User");

/**
 * Auth Middleware - JWT tokenni tekshiradi
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Token topilmadi. Iltimos, tizimga kiring.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, secret_key);

    const user = await User.findById(decoded.id).select("-__v");

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Foydalanuvchi topilmadi.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: false,
        message: "Sizning hisobingiz bloklangan.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Token muddati tugagan. Qayta kiring.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Noto'g'ri token.",
      });
    }
    return res.status(500).json({
      status: false,
      message: "Serverda xatolik yuz berdi.",
    });
  }
};

/**
 * Role Middleware - Foydalanuvchi rolini tekshiradi
 */
const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: "Avval tizimga kiring.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: "Sizda bu amalni bajarish uchun ruxsat yo'q.",
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
