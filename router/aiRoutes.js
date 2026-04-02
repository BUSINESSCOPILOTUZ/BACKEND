const router = require("express").Router();
const {
  generateContent,
  bizChatHandler,
  generateBizPlanHandler,
  generateWebsiteHandler,
  generateAdsHandler,
  marketAnalysisHandler,
  generateAdImagesHandler,
} = require("../controller/aiController");
const { aiLimiter, imageLimiter } = require("../middleware/rateLimiter");

// Rate-limited AI endpoints

// AI Kontent reja yaratish
router.post("/generate-content", aiLimiter, generateContent);

// AI Biznes chat
router.post("/biz-chat", aiLimiter, bizChatHandler);

// AI Biznes-reja yaratish
router.post("/generate-biz-plan", aiLimiter, generateBizPlanHandler);

// AI Sayt konsepti yaratish
router.post("/generate-website", aiLimiter, generateWebsiteHandler);

// AI Reklama kreativ yaratish
router.post("/generate-ads", aiLimiter, generateAdsHandler);

// AI Bozor tahlili
router.post("/market-analysis", aiLimiter, marketAnalysisHandler);

// AI DALL-E 3 rasm yaratish (TG / Meta) — stricter limit
router.post("/generate-ad-images", imageLimiter, generateAdImagesHandler);

module.exports = router;
