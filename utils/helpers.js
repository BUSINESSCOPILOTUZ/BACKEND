/**
 * Muvaffaqiyatli javob yuborish
 */
const successResponse = (
  res,
  data,
  message = "Muvaffaqiyatli",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
};

/**
 * Xatolik javobini yuborish
 */
const errorResponse = (
  res,
  message = "Xatolik yuz berdi",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    status: false,
    message,
  });
};

/**
 * Pagination helper
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 50;
  const skip = (page - 1) * limit;
  const sort = query.sort || "-createdAt";

  return { page, limit, skip, sort };
};

/**
 * Pul formatini chiqarish (O'zbek so'm)
 */
const formatMoney = (amount) => {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
};

/**
 * Telefon raqamni tekshirish (O'zbekiston formati)
 */
const isValidUzPhone = (phone) => {
  const phoneRegex = /^\+?998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Promokod generatsiya qilish
 */
const generatePromoCode = (name, length = 8) => {
  const prefix = name.substring(0, 4).toUpperCase().replace(/\s/g, "");
  const random = Math.random()
    .toString(36)
    .substring(2, 2 + (length - prefix.length))
    .toUpperCase();
  return prefix + random;
};

module.exports = {
  successResponse,
  errorResponse,
  getPaginationParams,
  formatMoney,
  isValidUzPhone,
  generatePromoCode,
};
