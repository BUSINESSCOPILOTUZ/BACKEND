const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const BotSettings = require("../models/BotSettings");
const KnowledgeBaseChunk = require("../models/KnowledgeBaseChunk");
const CustomerInteraction = require("../models/CustomerInteraction");

let openai = null;

const getOpenAI = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY topilmadi.");
    openai = new OpenAI({ apiKey });
  }
  return openai;
};

// ─── File Parsing ────────────────────────────────────────
const extractTextFromFile = async (filePath, mimeType) => {
  if (mimeType === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  // Plain text fallback
  return fs.readFileSync(filePath, "utf-8");
};

// ─── Chunk text into ~800 token pieces (simple split) ────
const chunkText = (text, maxChars = 2000) => {
  const chunks = [];
  const paragraphs = text.split(/\n\s*\n/);
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > maxChars && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

// ─── Knowledge Base ──────────────────────────────────────
const addKnowledgeFromFile = async (userId, filePath, fileName, mimeType) => {
  const text = await extractTextFromFile(filePath, mimeType);
  const chunks = chunkText(text);

  const docs = chunks.map((content, i) => ({
    userId,
    source: "file",
    fileName,
    content,
    chunkIndex: i,
    tokenCount: Math.ceil(content.length / 4),
  }));

  await KnowledgeBaseChunk.insertMany(docs);
  // Cleanup temp file
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { chunksAdded: docs.length, fileName };
};

const addKnowledgeFromText = async (userId, text) => {
  const chunks = chunkText(text);
  const docs = chunks.map((content, i) => ({
    userId,
    source: "text",
    fileName: "",
    content,
    chunkIndex: i,
    tokenCount: Math.ceil(content.length / 4),
  }));
  await KnowledgeBaseChunk.insertMany(docs);
  return { chunksAdded: docs.length };
};

const getKnowledgeChunks = async (userId) => {
  return KnowledgeBaseChunk.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
};

const deleteKnowledgeChunk = async (chunkId, userId) => {
  return KnowledgeBaseChunk.deleteOne({ _id: chunkId, userId });
};

const clearKnowledgeBase = async (userId) => {
  return KnowledgeBaseChunk.deleteMany({ userId });
};

// ─── RAG: Retrieve relevant chunks ──────────────────────
const retrieveContext = async (userId, userQuery, topK = 5) => {
  // Simple keyword-based retrieval (production would use embeddings)
  const allChunks = await KnowledgeBaseChunk.find({ userId }).lean();
  if (!allChunks.length) return "";

  const queryWords = userQuery
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = allChunks.map((chunk) => {
    const lower = chunk.content.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      const matches = (lower.match(new RegExp(word, "g")) || []).length;
      score += matches;
    }
    return { ...chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);
  return top.map((c) => c.content).join("\n\n---\n\n");
};

// ─── Bot Response (RAG + System Prompt) ──────────────────
const generateBotResponse = async (userId, userMessage) => {
  const ai = getOpenAI();

  const settings = await BotSettings.findOne({ userId });
  const systemPrompt =
    settings?.systemPrompt ||
    "Siz professional sotuvchisiz. Mijozlarga yordam bering.";

  const context = await retrieveContext(userId, userMessage);

  const messages = [
    {
      role: "system",
      content: `${systemPrompt}\n\n${
        context
          ? `Quyidagi bilimlar bazasi ma'lumotlaridan foydalaning:\n\n${context}`
          : "Bilimlar bazasi bo'sh. Umumiy ma'lumotlar asosida javob bering."
      }`,
    },
    { role: "user", content: userMessage },
  ];

  const result = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return result.choices[0].message.content;
};

// ─── Bot Token Validation ────────────────────────────────
const validateBotToken = async (token) => {
  const axios = require("axios");
  const res = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
  if (!res.data.ok) throw new Error("Bot token noto'g'ri.");
  return res.data.result; // { id, first_name, username, ... }
};

// ─── Settings CRUD ───────────────────────────────────────
const getSettings = async (userId) => {
  let settings = await BotSettings.findOne({ userId });
  if (!settings) {
    settings = await BotSettings.create({ userId });
  }
  return settings;
};

const updateSettings = async (userId, updates) => {
  return BotSettings.findOneAndUpdate({ userId }, updates, {
    new: true,
    upsert: true,
  });
};

// ─── Interactions / Analytics ────────────────────────────
const logInteraction = async (userId, data) => {
  return CustomerInteraction.create({ userId, ...data });
};

const getInteractions = async (userId, options = {}) => {
  const { limit = 50, type } = options;
  const filter = { userId };
  if (type) filter.type = type;
  return CustomerInteraction.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

const getAnalyticsSummary = async (userId, days = 7) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const total = await CustomerInteraction.countDocuments({
    userId,
    createdAt: { $gte: since },
  });

  const uniqueCustomers = await CustomerInteraction.distinct("chatId", {
    userId,
    createdAt: { $gte: since },
  });

  const retargets = await CustomerInteraction.countDocuments({
    userId,
    type: "retarget",
    createdAt: { $gte: since },
  });

  const resolved = await CustomerInteraction.countDocuments({
    userId,
    resolved: true,
    createdAt: { $gte: since },
  });

  const conversionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Activity by day for the last 7 days
  const activity = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await CustomerInteraction.countDocuments({
      userId,
      createdAt: { $gte: dayStart, $lte: dayEnd },
    });

    activity.push({
      day: dayStart.toLocaleDateString("uz-UZ", { weekday: "short" }),
      date: dayStart.toISOString().split("T")[0],
      count,
    });
  }

  return {
    totalInteractions: total,
    uniqueCustomers: uniqueCustomers.length,
    retargets,
    conversionRate,
    activity,
  };
};

const getRecentLogs = async (userId, count = 5) => {
  return CustomerInteraction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(count)
    .select("type username userMessage botResponse createdAt chatId")
    .lean();
};

module.exports = {
  extractTextFromFile,
  addKnowledgeFromFile,
  addKnowledgeFromText,
  getKnowledgeChunks,
  deleteKnowledgeChunk,
  clearKnowledgeBase,
  generateBotResponse,
  validateBotToken,
  getSettings,
  updateSettings,
  logInteraction,
  getInteractions,
  getAnalyticsSummary,
  getRecentLogs,
};
