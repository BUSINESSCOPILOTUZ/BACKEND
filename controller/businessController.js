const BizPlan = require("../models/BizPlan");
const {
  generateBizPlan,
  bizChat,
  generateWebsiteConcept,
} = require("../services/aiService");
const WebsiteProject = require("../models/WebsiteProject");

/**
 * AI Biznes chat - suhbat yuborish
 * POST /api/business/chat
 */
const sendChatMessage = async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: false,
        message: "Xabarni kiritish shart.",
      });
    }

    const aiResponse = await bizChat(chatHistory, message);

    res.status(200).json({
      status: true,
      data: {
        role: "model",
        text: aiResponse,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "AI bilan muloqotda xatolik: " + error.message,
    });
  }
};

/**
 * AI Biznes-reja yaratish
 * POST /api/business/generate-plan
 */
const generatePlan = async (req, res) => {
  try {
    const {
      industry,
      type,
      budget,
      equipment,
      team,
      country,
      region,
      district,
    } = req.body;

    if (!industry) {
      return res.status(400).json({
        status: false,
        message: "Sohani kiritish shart.",
      });
    }

    const formData = {
      industry,
      type,
      budget,
      equipment,
      team,
      country,
      region,
      district,
    };
    const generatedPlan = await generateBizPlan(formData);

    // Bazaga saqlash
    const bizPlan = await BizPlan.create({
      ...formData,
      generatedPlan,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: true,
      message: "Biznes-reja muvaffaqiyatli yaratildi",
      data: bizPlan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Biznes-reja yaratishda xatolik: " + error.message,
    });
  }
};

/**
 * Barcha biznes-rejalarni olish
 * GET /api/business/plans
 */
const getPlans = async (req, res) => {
  try {
    const plans = await BizPlan.find({ createdBy: req.user._id })
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      status: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Biznes-rejalarni olishda xatolik: " + error.message,
    });
  }
};

/**
 * Bitta biznes-rejani olish
 * GET /api/business/plans/:id
 */
const getPlanById = async (req, res) => {
  try {
    const plan = await BizPlan.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        status: false,
        message: "Biznes-reja topilmadi.",
      });
    }

    res.status(200).json({
      status: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Biznes-rejani olishda xatolik: " + error.message,
    });
  }
};

/**
 * Kredit kalkulyatori
 * POST /api/business/calculate-loan
 */
const calculateLoan = async (req, res) => {
  try {
    const { amount, rate, term } = req.body;

    if (!amount || !rate || !term) {
      return res.status(400).json({
        status: false,
        message: "Barcha maydonlarni to'ldiring.",
      });
    }

    const monthlyRate = rate / 100 / 12;
    const monthlyPayment =
      (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    res.status(200).json({
      status: true,
      data: {
        monthlyPayment: Math.round(monthlyPayment),
        totalPayment: Math.round(totalPayment),
        totalInterest: Math.round(totalInterest),
        amount,
        rate,
        term,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Hisoblashda xatolik: " + error.message,
    });
  }
};

/**
 * Soliq kalkulyatori
 * POST /api/business/calculate-tax
 */
const calculateTax = async (req, res) => {
  try {
    const { revenue, taxType } = req.body;

    if (!revenue) {
      return res.status(400).json({
        status: false,
        message: "Yillik tushumni kiritish shart.",
      });
    }

    let tax = 0;
    let description = "";

    switch (taxType) {
      case "simplified":
        tax = Math.round(revenue * 0.04);
        description = "Aylanmadan soliq (4%)";
        break;
      case "fixed":
        tax = 1200000;
        description = "Qat'iy belgilangan soliq";
        break;
      case "general":
        tax = Math.round(revenue * 0.12);
        description = "Umumbelgilangan (12% QQS + foyda)";
        break;
      default:
        tax = Math.round(revenue * 0.04);
        description = "Aylanmadan soliq (4%)";
    }

    res.status(200).json({
      status: true,
      data: {
        tax,
        description,
        revenue,
        taxType,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Soliq hisoblashda xatolik: " + error.message,
    });
  }
};

/**
 * AI Sayt konsepti yaratish
 * POST /api/business/generate-website
 */
const generateWebsite = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        status: false,
        message: "Sayt tavsifini kiritish shart.",
      });
    }

    const generatedResult = await generateWebsiteConcept(description);

    // Bazaga saqlash
    const website = await WebsiteProject.create({
      description,
      generatedResult,
      status: "draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: true,
      message: "Sayt konsepti muvaffaqiyatli yaratildi",
      data: website,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Sayt konsepti yaratishda xatolik: " + error.message,
    });
  }
};

/**
 * Barcha sayt loyihalarni olish
 * GET /api/business/websites
 */
const getWebsites = async (req, res) => {
  try {
    const websites = await WebsiteProject.find({ createdBy: req.user._id })
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      status: true,
      data: websites,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Sayt loyihalarni olishda xatolik: " + error.message,
    });
  }
};

module.exports = {
  sendChatMessage,
  generatePlan,
  getPlans,
  getPlanById,
  calculateLoan,
  calculateTax,
  generateWebsite,
  getWebsites,
};
