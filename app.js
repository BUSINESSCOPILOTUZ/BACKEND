// Requirement
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const databaseConnection = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const { initAI } = require("./services/aiService");

// Route imports
const authRoutes = require("./router/authRoutes");
const leadRoutes = require("./router/leadRoutes");
const influencerRoutes = require("./router/influencerRoutes");
const contentPlanRoutes = require("./router/contentPlanRoutes");
const analyticsRoutes = require("./router/analyticsRoutes");
const automationRoutes = require("./router/automationRoutes");
const businessRoutes = require("./router/businessRoutes");

// Middlewares
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/kassa", express.static(path.join(__dirname, "public", "kassa")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use("/audios", express.static(path.join(__dirname, "public", "audios")));
app.use("/archive", express.static(path.join(__dirname, "public", "archive")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// CORS sozlamalari
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Database va AI ulanish
databaseConnection();
initAI();

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: true,
    message: "BUSINESS COPILOT API ishlayapti ✅",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/influencers", influencerRoutes);
app.use("/api/content-plans", contentPlanRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/business", businessRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Server ishga tushirish
const PORT = process.env.PORT || 9005;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 BUSINESS COPILOT Server ishga tushdi`);
  console.log(`📡 Port: ${server.address().port}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`📋 API: http://localhost:${PORT}/api/health\n`);
});

// 404 - Route topilmadi
app.all("*", async (req, res) =>
  res
    .status(404)
    .json({
      status: false,
      message: `Router mavjud emas: ${req.method} ${req.originalUrl}`,
    }),
);
