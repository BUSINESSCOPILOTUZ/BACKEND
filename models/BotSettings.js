const mongoose = require("mongoose");

const botSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    botToken: {
      type: String,
      default: "",
    },
    botUsername: {
      type: String,
      default: "",
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    systemPrompt: {
      type: String,
      default:
        "Siz xushmuomala va professional sotuvchisiz. Mijozlarga mahsulotlar haqida batafsil ma'lumot bering, narxlarni ayting va xarid qilishga undang.",
    },
    // Re-engagement settings
    retargetEnabled: {
      type: Boolean,
      default: false,
    },
    retargetDays: {
      type: Number,
      default: 7,
    },
    retargetMessage: {
      type: String,
      default:
        "Assalomu alaykum! Sizni yana ko'rganimizdan xursandmiz. Yangi mahsulotlarimiz bilan tanishing! 🎁",
    },
    // Loyalty settings
    loyaltyEnabled: {
      type: Boolean,
      default: false,
    },
    loyaltyDiscountPercent: {
      type: Number,
      default: 10,
    },
    loyaltyMessage: {
      type: String,
      default:
        "Hurmatli mijozimiz! Sodiq mijozimiz sifatida sizga maxsus chegirma taqdim etamiz: {discount}% 🎉",
    },
    webhookUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BotSettings", botSettingsSchema);
