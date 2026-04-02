const mongoose = require("mongoose");

const customerInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chatId: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      default: "",
    },
    firstName: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["message", "faq", "purchase", "retarget", "loyalty", "error"],
      default: "message",
    },
    userMessage: {
      type: String,
      default: "",
    },
    botResponse: {
      type: String,
      default: "",
    },
    resolved: {
      type: Boolean,
      default: true,
    },
    interactionCount: {
      type: Number,
      default: 1,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

customerInteractionSchema.index({ userId: 1, chatId: 1 });
customerInteractionSchema.index({ userId: 1, createdAt: -1 });
customerInteractionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model(
  "CustomerInteraction",
  customerInteractionSchema
);
