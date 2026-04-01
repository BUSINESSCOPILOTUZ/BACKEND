const {
  generateContentPlan,
  generateBizPlan,
  bizChat,
  generateWebsiteConcept,
} = require("../services/aiService");

/**
 * Public AI Kontent reja yaratish (auth shart emas)
 * POST /api/ai/generate-content
 */
const generateContent = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        status: false,
        message: "Mavzuni kiritish shart.",
      });
    }

    const planRaw = await generateContentPlan(topic);

    // JSON parse qilishga harakat qilish
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(planRaw);
    } catch {
      parsedPlan = null;
    }

    res.status(200).json({
      status: true,
      data: {
        text: planRaw,
        posts: parsedPlan ? parsedPlan.posts : [],
      },
    });
  } catch (error) {
    console.error("AI Content Error:", error.message);
    res.status(500).json({
      status: false,
      message: "AI xizmatida xatolik: " + error.message,
    });
  }
};

/**
 * Public AI Biznes chat (auth shart emas)
 * POST /api/ai/biz-chat
 */
const bizChatHandler = async (req, res) => {
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
      data: { role: "model", text: aiResponse },
    });
  } catch (error) {
    console.error("AI BizChat Error:", error.message);
    res.status(500).json({
      status: false,
      message: "AI xizmatida xatolik: " + error.message,
    });
  }
};

/**
 * Public AI Biznes-reja yaratish (auth shart emas)
 * POST /api/ai/generate-biz-plan
 */
const generateBizPlanHandler = async (req, res) => {
  try {
    const formData = req.body;

    if (!formData.industry) {
      return res.status(400).json({
        status: false,
        message: "Sohani kiritish shart.",
      });
    }

    const plan = await generateBizPlan(formData);

    res.status(200).json({
      status: true,
      data: { role: "model", text: plan },
    });
  } catch (error) {
    console.error("AI BizPlan Error:", error.message);
    res.status(500).json({
      status: false,
      message: "AI xizmatida xatolik: " + error.message,
    });
  }
};

/**
 * Public AI Sayt konsepti yaratish (auth shart emas)
 * POST /api/ai/generate-website
 */
const generateWebsiteHandler = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        status: false,
        message: "Sayt tavsifini kiritish shart.",
      });
    }

    const result = await generateWebsiteConcept(description);

    res.status(200).json({
      status: true,
      data: { text: result },
    });
  } catch (error) {
    console.error("AI Website Error:", error.message);
    res.status(500).json({
      status: false,
      message: "AI xizmatida xatolik: " + error.message,
    });
  }
};

/**
 * Public AI Reklama kreativ yaratish
 * POST /api/ai/generate-ads
 */
const generateAdsHandler = async (req, res) => {
  try {
    const { description, platform } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        status: false,
        message: "Mahsulot tavsifini kiritish shart.",
      });
    }

    const { generateAds } = require("../services/aiService");
    const result = await generateAds(description, platform || "ig");

    // JSON formatini parse qilish
    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch {
      parsed = { creative: result, hooks: [], ctas: [] };
    }

    res.status(200).json({
      status: true,
      data: parsed,
    });
  } catch (error) {
    console.error("AI Ads Error:", error.message);
    res.status(500).json({
      status: false,
      message: "AI xizmatida xatolik: " + error.message,
    });
  }
};

/**
 * Public AI Bozor tahlili
 * POST /api/ai/market-analysis
 */
const marketAnalysisHandler = async (req, res) => {
  try {
    const { businessIdea } = req.body;

    if (!businessIdea || !businessIdea.trim()) {
      return res.status(400).json({
        status: false,
        message: "Biznes g'oyasini kiritish shart.",
      });
    }

    const { generateMarketAnalysis } = require("../services/aiService");
    const result = await generateMarketAnalysis(businessIdea);

    res.status(200).json({
      status: true,
      data: { text: result },
    });
  } catch (error) {
    console.error("AI Market Analysis Error:", error.message);
    res.status(500).json({
      status: false,
      message: "AI xizmatida xatolik: " + error.message,
    });
  }
};

module.exports = {
  generateContent,
  bizChatHandler,
  generateBizPlanHandler,
  generateWebsiteHandler,
  generateAdsHandler,
  marketAnalysisHandler,
};
