const mongoose = require("mongoose");

const BizPlanSchema = new mongoose.Schema(
  {
    industry: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["online", "offline", "an'anaviy"],
      default: "online",
    },
    budget: {
      type: String,
      default: "",
    },
    equipment: {
      type: String,
      default: "",
    },
    team: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "O'zbekiston",
    },
    region: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    generatedPlan: {
      type: String,
      default: "",
    },
    chatHistory: [
      {
        role: {
          type: String,
          enum: ["user", "model"],
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
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

BizPlanSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BizPlan", BizPlanSchema);
