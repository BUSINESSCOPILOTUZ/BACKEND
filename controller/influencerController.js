const Influencer = require("../models/Influencer");

/**
 * Barcha influencerlarni olish
 * GET /api/influencers
 */
const getInfluencers = async (req, res) => {
  try {
    const { search, platform, page = 1, limit = 50 } = req.query;

    const filter = { createdBy: req.user._id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { promoCode: { $regex: search, $options: "i" } },
      ];
    }

    if (platform) {
      filter.platform = platform;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [influencers, total] = await Promise.all([
      Influencer.find(filter)
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Influencer.countDocuments(filter),
    ]);

    res.status(200).json({
      status: true,
      data: influencers,
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
      message: "Influencerlarni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Bitta influencerni olish
 * GET /api/influencers/:id
 */
const getInfluencerById = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!influencer) {
      return res.status(404).json({
        status: false,
        message: "Influencer topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      data: influencer,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Influencerni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Yangi influencer qo'shish
 * POST /api/influencers
 */
const createInfluencer = async (req, res) => {
  try {
    const { name, followers, promoCode, platform, contactPhone, contactEmail } =
      req.body;

    const influencer = await Influencer.create({
      name,
      followers: followers || "0",
      promoCode,
      platform: platform || "Instagram",
      contactPhone: contactPhone || "",
      contactEmail: contactEmail || "",
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: true,
      message: "Influencer muvaffaqiyatli qo'shildi",
      data: influencer,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Influencer qo'shishda xatolik: " + error.message,
    });
  }
};

/**
 * Influencerni yangilash
 * PUT /api/influencers/:id
 */
const updateInfluencer = async (req, res) => {
  try {
    const {
      name,
      followers,
      promoCode,
      conversions,
      revenue,
      platform,
      contactPhone,
      contactEmail,
      isActive,
    } = req.body;

    const influencer = await Influencer.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        name,
        followers,
        promoCode,
        conversions,
        revenue,
        platform,
        contactPhone,
        contactEmail,
        isActive,
      },
      { new: true, runValidators: true },
    );

    if (!influencer) {
      return res.status(404).json({
        status: false,
        message: "Influencer topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Influencer yangilandi",
      data: influencer,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Influencerni yangilashda xatolik: " + error.message,
    });
  }
};

/**
 * Influencerni o'chirish
 * DELETE /api/influencers/:id
 */
const deleteInfluencer = async (req, res) => {
  try {
    const influencer = await Influencer.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!influencer) {
      return res.status(404).json({
        status: false,
        message: "Influencer topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Influencer o'chirildi",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Influencerni o'chirishda xatolik: " + error.message,
    });
  }
};

/**
 * Promokod orqali influencerni topish (public)
 * GET /api/influencers/promo/:code
 */
const findByPromoCode = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({
      promoCode: req.params.code.toUpperCase(),
      isActive: true,
    }).select("name promoCode followers platform");

    if (!influencer) {
      return res.status(404).json({
        status: false,
        message: "Promokod topilmadi.",
      });
    }

    // Konversiyani +1 qilish
    influencer.conversions = (influencer.conversions || 0) + 1;
    await influencer.save();

    res.status(200).json({
      status: true,
      data: influencer,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Promokodni tekshirishda xatolik: " + error.message,
    });
  }
};

module.exports = {
  getInfluencers,
  getInfluencerById,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  findByPromoCode,
};
