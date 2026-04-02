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

// Barcha AI endpointlar PUBLIC (auth shart emas)
// Frontend to'g'ridan-to'g'ri shu endpointlarni chaqiradi

// AI Kontent reja yaratish
router.post("/generate-content", generateContent);

// AI Biznes chat
router.post("/biz-chat", bizChatHandler);

// AI Biznes-reja yaratish
router.post("/generate-biz-plan", generateBizPlanHandler);

// AI Sayt konsepti yaratish
router.post("/generate-website", generateWebsiteHandler);

// AI Reklama kreativ yaratish
router.post("/generate-ads", generateAdsHandler);

// AI Bozor tahlili
router.post("/market-analysis", marketAnalysisHandler);

// AI DALL-E 3 rasm yaratish (TG / Meta)
router.post("/generate-ad-images", generateAdImagesHandler);

module.exports = router;
