const router = require("express").Router();
const {
  getDashboard,
  getWeeklyLeads,
  getMonthlyRevenue,
  getLeadsBySource,
} = require("../controller/analyticsController");
const { authMiddleware } = require("../middleware/auth");

// Barcha routelar auth talab qiladi
router.use(authMiddleware);

// Dashboard umumiy statistika
router.get("/dashboard", getDashboard);

// Haftalik lidlar o'sishi (grafik uchun)
router.get("/weekly-leads", getWeeklyLeads);

// Oylik daromad dinamikasi (grafik uchun)
router.get("/monthly-revenue", getMonthlyRevenue);

// Lidlar manba bo'yicha taqsimoti
router.get("/leads-by-source", getLeadsBySource);

module.exports = router;
