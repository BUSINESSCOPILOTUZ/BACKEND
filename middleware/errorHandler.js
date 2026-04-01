/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      status: false,
      message: "Ma'lumot kiritishda xatolik",
      errors: messages,
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: false,
      message: `Bu ${field} allaqachon mavjud.`,
    });
  }

  // Mongoose Cast Error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      status: false,
      message: "Noto'g'ri ID formati.",
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    status: false,
    message: err.message || "Serverda xatolik yuz berdi.",
  });
};

module.exports = errorHandler;
