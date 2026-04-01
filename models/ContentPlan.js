const mongoose = require("mongoose");

const ScheduledPostSchema = new mongoose.Schema({
  day: { type: String, default: "" },
  date: { type: String, required: true },
  time: { type: String, required: true },
  title: { type: String, default: "" },
  type: { type: String, default: "matn" },
  content: { type: String, required: true },
  hashtags: [{ type: String }],
  status: {
    type: String,
    enum: ["pending", "scheduled", "sent", "failed"],
    default: "pending",
  },
  telegramMessageId: { type: Number, default: null },
  sentAt: { type: Date, default: null },
  error: { type: String, default: null },
});

const AssetSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image"],
    default: "text",
  },
  content: {
    type: String,
    default: "",
  },
});

const ContentPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Kontent reja nomi kiritish shart"],
      trim: true,
    },
    rawText: {
      type: String,
      required: [true, "Mavzuni kiritish shart"],
    },
    generatedPlan: {
      type: String,
      default: "",
    },
    scheduledPosts: [ScheduledPostSchema],
    telegramChannelId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "rejected"],
      default: "pending",
    },
    assets: [AssetSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

ContentPlanSchema.index({ status: 1 });
ContentPlanSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ContentPlan", ContentPlanSchema);
