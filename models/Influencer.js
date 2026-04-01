const mongoose = require("mongoose");

const InfluencerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Influencer ismini kiritish shart"],
      trim: true,
    },
    followers: {
      type: String,
      default: "0",
    },
    promoCode: {
      type: String,
      required: [true, "Promokodni kiritish shart"],
      unique: true,
      uppercase: true,
      trim: true,
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
      enum: ["Instagram", "Telegram", "YouTube", "TikTok", "Other"],
      default: "Instagram",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

InfluencerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Influencer", InfluencerSchema);
