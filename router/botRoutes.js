const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  validateToken,
  getSettings,
  updateSettings,
  uploadKnowledge,
  getKnowledge,
  deleteKnowledge,
  clearKnowledge,
  handleChat,
  getAnalytics,
  getRecentLogs,
  handleWebhook,
} = require("../controller/botController");

// Multer setup for file uploads (PDF, DOCX, TXT)
const uploadDir = path.join(__dirname, "..", "public", "uploads", "knowledge");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Faqat PDF, DOCX va TXT fayllar qabul qilinadi."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ─── Token Validation ────────────────────────────────────
router.post("/validate-token", validateToken);

// ─── Settings ────────────────────────────────────────────
router.get("/settings/:userId", getSettings);
router.put("/settings/:userId", updateSettings);

// ─── Knowledge Base ──────────────────────────────────────
router.post("/knowledge/:userId", upload.single("file"), uploadKnowledge);
router.get("/knowledge/:userId", getKnowledge);
router.delete("/knowledge/:userId/:chunkId", deleteKnowledge);
router.delete("/knowledge/:userId", clearKnowledge);

// ─── Chat (test from dashboard) ──────────────────────────
router.post("/chat/:userId", handleChat);

// ─── Analytics ───────────────────────────────────────────
router.get("/analytics/:userId", getAnalytics);
router.get("/logs/:userId", getRecentLogs);

// ─── Telegram Webhook (called by Telegram servers) ───────
router.post("/webhook/:userId", handleWebhook);

module.exports = router;
