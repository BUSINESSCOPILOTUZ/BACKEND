const router = require("express").Router();
const {
  sendChatMessage,
  generatePlan,
  getPlans,
  getPlanById,
  calculateLoan,
  calculateTax,
  generateWebsite,
  getWebsites,
} = require("../controller/businessController");
const { authMiddleware } = require("../middleware/auth");

// Barcha routelar auth talab qiladi
router.use(authMiddleware);

// AI Biznes chat
router.post("/chat", sendChatMessage);

// Biznes-reja yaratish va olish
router.post("/generate-plan", generatePlan);
router.get("/plans", getPlans);
router.get("/plans/:id", getPlanById);

// Kalkulyatorlar
router.post("/calculate-loan", calculateLoan);
router.post("/calculate-tax", calculateTax);

// AI Sayt yaratish
router.post("/generate-website", generateWebsite);
router.get("/websites", getWebsites);

module.exports = router;
