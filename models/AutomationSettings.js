const mongoose = require("mongoose");

const AutomationSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    telegramBot: {
      type: Boolean,
      default: true,
    },
    autoPosting: {
      type: Boolean,
      default: false,
    },
    aiReply: {
      type: Boolean,
      default: true,
    },
    welcomeMessage: {
      type: String,
      default: "Assalomu alaykum! BUSINESS COPILOT ga xush kelibsiz.",
    },
    telegramBotToken: {
      type: String,
      default: "",
    },
    instagramToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AutomationSettings", AutomationSettingsSchema);
