const ContentPlan = require("../models/ContentPlan");
const { generateContentPlan } = require("../services/aiService");
const {
  sendToChannel,
  formatPostForTelegram,
} = require("../services/telegramService");

/**
 * Barcha kontent rejalarni olish
 * GET /api/content-plans
 */
const getContentPlans = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    // Faqat shu foydalanuvchiga tegishli rejalarni ko'rsatish
    const filter = { createdBy: req.user._id };

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [plans, total] = await Promise.all([
      ContentPlan.find(filter)
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ContentPlan.countDocuments(filter),
    ]);

    res.status(200).json({
      status: true,
      data: plans,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Kontent rejalarni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Bitta kontent rejani olish
 * GET /api/content-plans/:id
 */
const getContentPlanById = async (req, res) => {
  try {
    const plan = await ContentPlan.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        status: false,
        message: "Kontent reja topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Kontent rejani olishda xatolik: " + error.message,
    });
  }
};

/**
 * AI yordamida kontent reja yaratish
 * POST /api/content-plans/generate
 */
const generatePlan = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        status: false,
        message: "Mavzuni kiritish shart.",
      });
    }

    // AI orqali reja generatsiya qilish (JSON format)
    const generatedPlanRaw = await generateContentPlan(topic);

    // JSON parse qilish
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(generatedPlanRaw);
    } catch {
      // Agar JSON parse bo'lmasa, eski formatda saqlash
      const plan = await ContentPlan.create({
        title: "AI Reja: " + topic.substring(0, 50),
        rawText: topic,
        generatedPlan: generatedPlanRaw,
        scheduledPosts: [],
        status: "pending",
        createdBy: req.user._id,
      });
      return res.status(201).json({
        status: true,
        message: "Kontent reja muvaffaqiyatli yaratildi",
        data: plan,
      });
    }

    // Strukturali postlarni yaratish
    const scheduledPosts = (parsedPlan.posts || []).map((post) => ({
      day: post.day || "",
      date: post.date || "",
      time: post.time || "10:00",
      title: post.title || "",
      type: post.type || "matn",
      content: post.content || "",
      hashtags: post.hashtags || [],
      status: "pending",
    }));

    // Bazaga saqlash
    const plan = await ContentPlan.create({
      title: "AI Reja: " + topic.substring(0, 50),
      rawText: topic,
      generatedPlan: generatedPlanRaw,
      scheduledPosts,
      status: "pending",
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: true,
      message: "Kontent reja muvaffaqiyatli yaratildi",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Kontent reja yaratishda xatolik: " + error.message,
    });
  }
};

/**
 * Kontent rejani yangilash
 * PUT /api/content-plans/:id
 */
const updateContentPlan = async (req, res) => {
  try {
    const { title, generatedPlan, status } = req.body;

    // Faqat o'z rejasini o'zgartira oladi
    const plan = await ContentPlan.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { title, generatedPlan, status },
      { new: true, runValidators: true },
    );

    if (!plan) {
      return res.status(404).json({
        status: false,
        message: "Kontent reja topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Kontent reja yangilandi",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Kontent rejani yangilashda xatolik: " + error.message,
    });
  }
};

/**
 * Kontent rejani o'chirish
 * DELETE /api/content-plans/:id
 */
const deleteContentPlan = async (req, res) => {
  try {
    // Faqat o'z rejasini o'chira oladi
    const plan = await ContentPlan.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        status: false,
        message: "Kontent reja topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Kontent reja o'chirildi",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Kontent rejani o'chirishda xatolik: " + error.message,
    });
  }
};

/**
 * Kontent rejani tasdiqlash va Telegram kanalga rejalashtirish
 * PUT /api/content-plans/:id/approve
 */
const approveContentPlan = async (req, res) => {
  try {
    const { telegramChannelId, scheduledPosts: updatedPosts } = req.body;

    const plan = await ContentPlan.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        status: false,
        message: "Kontent reja topilmadi.",
      });
    }

    // Statusni approved ga o'zgartirish
    plan.status = "approved";

    // Telegram kanal ID saqlash
    if (telegramChannelId) {
      plan.telegramChannelId = telegramChannelId;
    }

    // Frontenddan kelgan yangilangan sana/vaqtlarni qo'llash
    if (updatedPosts && updatedPosts.length > 0) {
      for (let i = 0; i < plan.scheduledPosts.length; i++) {
        if (updatedPosts[i]) {
          plan.scheduledPosts[i].date =
            updatedPosts[i].date || plan.scheduledPosts[i].date;
          plan.scheduledPosts[i].time =
            updatedPosts[i].time || plan.scheduledPosts[i].time;
        }
        if (plan.scheduledPosts[i].status === "pending") {
          plan.scheduledPosts[i].status = "scheduled";
        }
      }
    } else {
      // Postlarni scheduled statusiga o'tkazish
      for (const post of plan.scheduledPosts) {
        if (post.status === "pending") {
          post.status = "scheduled";
        }
      }
    }

    await plan.save();

    res.status(200).json({
      status: true,
      message: `Kontent reja tasdiqlandi. ${plan.scheduledPosts.length} ta post rejalashtirildi.`,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Tasdiqlashda xatolik: " + error.message,
    });
  }
};

module.exports = {
  getContentPlans,
  getContentPlanById,
  generatePlan,
  updateContentPlan,
  deleteContentPlan,
  approveContentPlan,
};
