const ContentPlan = require("../models/ContentPlan");
const { generateContentPlan } = require("../services/aiService");

/**
 * Barcha kontent rejalarni olish
 * GET /api/content-plans
 */
const getContentPlans = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

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

    // AI orqali reja generatsiya qilish
    const generatedPlan = await generateContentPlan(topic);

    // Bazaga saqlash
    const plan = await ContentPlan.create({
      title: "AI Reja: " + topic.substring(0, 50),
      rawText: topic,
      generatedPlan,
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
 * Kontent rejani tasdiqlash
 * PUT /api/content-plans/:id/approve
 */
const approveContentPlan = async (req, res) => {
  try {
    const plan = await ContentPlan.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status: "approved" },
      { new: true },
    );

    if (!plan) {
      return res.status(404).json({
        status: false,
        message: "Kontent reja topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Kontent reja tasdiqlandi",
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
