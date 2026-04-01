const AutomationSettings = require("../models/AutomationSettings");

/**
 * Avtomatizatsiya sozlamalarini olish
 * GET /api/automation
 */
const getSettings = async (req, res) => {
  try {
    let settings = await AutomationSettings.findOne({ userId: req.user._id });

    if (!settings) {
      // Yangi sozlamalar yaratish
      settings = await AutomationSettings.create({
        userId: req.user._id,
      });
    }

    res.status(200).json({
      status: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Sozlamalarni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Avtomatizatsiya sozlamalarini yangilash
 * PUT /api/automation
 */
const updateSettings = async (req, res) => {
  try {
    const {
      telegramBot,
      autoPosting,
      aiReply,
      welcomeMessage,
      telegramBotToken,
      instagramToken,
    } = req.body;

    let settings = await AutomationSettings.findOneAndUpdate(
      { userId: req.user._id },
      {
        telegramBot,
        autoPosting,
        aiReply,
        welcomeMessage,
        telegramBotToken,
        instagramToken,
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.status(200).json({
      status: true,
      message: "Sozlamalar muvaffaqiyatli saqlandi",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Sozlamalarni saqlashda xatolik: " + error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
