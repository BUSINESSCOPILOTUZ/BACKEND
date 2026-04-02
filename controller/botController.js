const botService = require("../services/botService");

// ─── Validate Telegram Bot Token ─────────────────────────
const validateToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string" || token.trim().length < 30) {
      return res.status(400).json({ status: false, message: "Bot token noto'g'ri formatda." });
    }
    const botInfo = await botService.validateBotToken(token.trim());
    res.json({ status: true, data: botInfo });
  } catch (err) {
    res.status(400).json({ status: false, message: "Bot token noto'g'ri yoki muddati tugagan." });
  }
};

// ─── Get / Update Settings ───────────────────────────────
const getSettings = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const settings = await botService.getSettings(userId);
    res.json({ status: true, data: settings });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const allowedFields = [
      "botToken",
      "botUsername",
      "isConnected",
      "systemPrompt",
      "retargetEnabled",
      "retargetDays",
      "retargetMessage",
      "loyaltyEnabled",
      "loyaltyDiscountPercent",
      "loyaltyMessage",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const settings = await botService.updateSettings(userId, updates);
    res.json({ status: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// ─── Knowledge Base ──────────────────────────────────────
const uploadKnowledge = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (req.file) {
      const result = await botService.addKnowledgeFromFile(
        userId,
        req.file.path,
        req.file.originalname,
        req.file.mimetype
      );
      return res.json({ status: true, data: result });
    }

    if (req.body.text) {
      const text = req.body.text;
      if (text.length > 50000) {
        return res.status(400).json({ status: false, message: "Matn 50,000 belgidan oshmasligi kerak." });
      }
      const result = await botService.addKnowledgeFromText(userId, text);
      return res.json({ status: true, data: result });
    }

    res.status(400).json({ status: false, message: "Fayl yoki matn yuborilmadi." });
  } catch (err) {
    next(err);
  }
};

const getKnowledge = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const chunks = await botService.getKnowledgeChunks(userId);
    res.json({ status: true, data: chunks });
  } catch (err) {
    next(err);
  }
};

const deleteKnowledge = async (req, res, next) => {
  try {
    const { userId, chunkId } = req.params;
    await botService.deleteKnowledgeChunk(chunkId, userId);
    res.json({ status: true, message: "O'chirildi." });
  } catch (err) {
    next(err);
  }
};

const clearKnowledge = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await botService.clearKnowledgeBase(userId);
    res.json({ status: true, message: "Barcha ma'lumotlar tozalandi." });
  } catch (err) {
    next(err);
  }
};

// ─── Chat / Webhook Handler ─────────────────────────────
const handleChat = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const { message, chatId, username, firstName } = req.body;

    if (!message) {
      return res.status(400).json({ status: false, message: "Xabar bo'sh." });
    }

    const response = await botService.generateBotResponse(userId, message);

    // Log interaction
    await botService.logInteraction(userId, {
      chatId: chatId || 0,
      username: username || "",
      firstName: firstName || "",
      type: "faq",
      userMessage: message,
      botResponse: response,
      resolved: true,
    });

    res.json({ status: true, data: { response } });
  } catch (err) {
    if (err.status === 429 || err.code === "rate_limit_exceeded") {
      return res.status(429).json({
        status: false,
        message: "AI xizmati hozir band. Biroz kutib qayta urinib ko'ring.",
      });
    }
    next(err);
  }
};

// ─── Analytics ───────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const days = parseInt(req.query.days) || 7;
    const summary = await botService.getAnalyticsSummary(userId, days);
    res.json({ status: true, data: summary });
  } catch (err) {
    next(err);
  }
};

const getRecentLogs = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const count = parseInt(req.query.count) || 5;
    const logs = await botService.getRecentLogs(userId, count);
    res.json({ status: true, data: logs });
  } catch (err) {
    next(err);
  }
};

// ─── Telegram Webhook ────────────────────────────────────
const handleWebhook = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const update = req.body;

    if (!update.message || !update.message.text) {
      return res.sendStatus(200);
    }

    const msg = update.message;
    const response = await botService.generateBotResponse(userId, msg.text);

    // Log the interaction
    await botService.logInteraction(userId, {
      chatId: msg.chat.id,
      username: msg.from?.username || "",
      firstName: msg.from?.first_name || "",
      type: "message",
      userMessage: msg.text,
      botResponse: response,
      resolved: true,
    });

    // Send response back to Telegram
    const settings = await botService.getSettings(userId);
    if (settings.botToken) {
      const axios = require("axios");
      await axios.post(
        `https://api.telegram.org/bot${settings.botToken}/sendMessage`,
        {
          chat_id: msg.chat.id,
          text: response,
          parse_mode: "Markdown",
        }
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.sendStatus(200); // Always 200 to Telegram
  }
};

module.exports = {
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
};
