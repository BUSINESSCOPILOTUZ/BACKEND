const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lid ismini kiritish shart"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon raqamini kiritish shart"],
      trim: true,
    },
    source: {
      type: String,
      enum: [
        "Instagram",
        "Telegram",
        "Facebook",
        "Website",
        "Referral",
        "Other",
      ],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["cold", "warm", "hot", "appointment"],
      default: "cold",
    },
    messages: [MessageSchema],
    notes: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

LeadSchema.index({ status: 1 });
LeadSchema.index({ source: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ name: "text", phone: "text" });

module.exports = mongoose.model("Lead", LeadSchema);
