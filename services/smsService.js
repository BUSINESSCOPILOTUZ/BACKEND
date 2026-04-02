/**
 * SMS OTP Service — Eskiz.uz API orqali SMS yuborish
 *
 * Eskiz.uz — O'zbekistonda SMS yuborish uchun API xizmati.
 * Bu service quyidagilarni bajaradi:
 *   1. Eskiz API'dan token olish (avtorizatsiya)
 *   2. Telefon raqamiga OTP (bir martalik kod) SMS yuborish
 *   3. OTP kodni generatsiya qilish (6 xonali tasodifiy raqam)
 */

const axios = require("axios");

// Eskiz API asosiy URL
const ESKIZ_BASE_URL = "https://notify.eskiz.uz/api";

// Eskiz tokenni keshda saqlash (har safar yangi token olmaslik uchun)
let eskizToken = null;
let tokenExpires = null;

/**
 * Eskiz API'dan avtorizatsiya tokenini olish
 * Token 30 kunga amal qiladi, shuning uchun keshlaymiz
 *
 * @returns {string} Bearer token
 */
const getEskizToken = async () => {
  // Agar token mavjud va muddati tugamagan bo'lsa — keshdan qaytarish
  if (eskizToken && tokenExpires && new Date() < tokenExpires) {
    return eskizToken;
  }

  try {
    const response = await axios.post(`${ESKIZ_BASE_URL}/auth/login`, {
      email: process.env.ESKIZ_EMAIL,
      password: process.env.ESKIZ_PASSWORD,
    });

    // Tokenni saqlash
    eskizToken = response.data.data.token;
    // Token 30 kun amal qiladi, biz 29 kun qilib belgilaymiz (xavfsizlik uchun)
    tokenExpires = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000);

    console.log("✅ Eskiz SMS token olindi");
    return eskizToken;
  } catch (error) {
    console.error(
      "❌ Eskiz token olishda xatolik:",
      error.response?.data || error.message,
    );
    throw new Error("SMS xizmatiga ulanishda xatolik");
  }
};

/**
 * 6 xonali tasodifiy OTP kod generatsiya qilish
 * Masalan: 482917, 103856, 739201
 *
 * @returns {string} 6 xonali raqam (string formatda)
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Telefon raqamiga SMS yuborish (Eskiz API orqali)
 *
 * @param {string} phone — Telefon raqami (998901234567 formatda)
 * @param {string} message — SMS matni
 * @returns {object} Eskiz API javobi
 */
const sendSMS = async (phone, message) => {
  try {
    const token = await getEskizToken();

    // Telefon raqamini tozalash (faqat raqamlar)
    const cleanPhone = phone.replace(/\D/g, "");

    const response = await axios.post(
      `${ESKIZ_BASE_URL}/message/sms/send`,
      {
        mobile_phone: cleanPhone,
        message: message,
        from: "4546", // Eskiz standart sender ID
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(`✅ SMS yuborildi: ${cleanPhone}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ SMS yuborishda xatolik:",
      error.response?.data || error.message,
    );

    // Agar token muddati tugagan bo'lsa — yangi token olib qayta urinish
    if (error.response?.status === 401) {
      eskizToken = null;
      tokenExpires = null;
      console.log("🔄 Eskiz token yangilanmoqda...");
      return sendSMS(phone, message); // Qayta urinish
    }

    throw new Error("SMS yuborishda xatolik yuz berdi");
  }
};

/**
 * OTP SMS yuborish — asosiy funksiya
 * Telefon raqamiga tasdiqlash kodini yuboradi
 *
 * @param {string} phone — Telefon raqami (998XXXXXXXXX)
 * @returns {object} { otp, expiresAt } — Generatsiya qilingan kod va amal qilish muddati
 */
const sendOTP = async (phone) => {
  // 1. OTP kod generatsiya qilish
  const otp = generateOTP();

  // 2. SMS matni tayyorlash
  const message = `BUSINESS COPILOT: Sizning tasdiqlash kodingiz: ${otp}. Kod 5 daqiqa amal qiladi.`;

  // 3. SMS yuborish
  await sendSMS(phone, message);

  // 4. OTP amal qilish muddati (5 daqiqa)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  return { otp, expiresAt };
};

module.exports = {
  generateOTP,
  sendSMS,
  sendOTP,
  getEskizToken,
};
