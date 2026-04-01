const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    leadsCount: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    platform: {
      type: String,
      enum: ["telegram", "instagram", "facebook", "website", "all"],
      default: "all",
    },
    roi: {
      type: Number,
      default: 0,
    },
    cac: {
      type: Number,
      default: 0,
    },
    ltv: {
      type: Number,
      default: 0,
    },
    aiMessages: {
      type: Number,
      default: 0,
    },
    weeklyData: [
      {
        day: String,
        leads: Number,
      },
    ],
    monthlyRevenue: [
      {
        month: String,
        revenue: Number,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

AnalyticsSchema.index({ date: -1 });
AnalyticsSchema.index({ platform: 1 });

module.exports = mongoose.model("Analytics", AnalyticsSchema);
