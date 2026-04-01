const mongoose = require("mongoose");

const WebsiteProjectSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Sayt tavsifini kiritish shart"],
    },
    generatedResult: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "in_progress", "completed"],
      default: "draft",
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

WebsiteProjectSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WebsiteProject", WebsiteProjectSchema);
