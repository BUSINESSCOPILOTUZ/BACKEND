const rateLimit = require("express-rate-limit");

// AI generation routes — expensive OpenAI calls
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Juda ko'p so'rov. 1 daqiqa kutib qayta urinib ko'ring.",
  },
});

// DALL-E image generation — very expensive
const imageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 image generation requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Rasm yaratish uchun juda ko'p so'rov. 1 daqiqa kutib qayta urinib ko'ring.",
  },
});

// Auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Juda ko'p urinish. 15 daqiqa kutib qayta urinib ko'ring.",
  },
});

module.exports = { aiLimiter, imageLimiter, authLimiter };
