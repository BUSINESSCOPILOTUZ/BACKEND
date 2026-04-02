const router = require("express").Router();
const { authMiddleware } = require("../middleware/auth");
const {
  getContentPlans,
  getContentPlanById,
  generatePlan,
  updateContentPlan,
  deleteContentPlan,
  approveContentPlan,
} = require("../controller/contentPlanController");

// Barcha routelar AUTH — faqat tizimga kirgan foydalanuvchi ishlata oladi

// AI orqali kontent reja generatsiya qilish
router.post("/generate", authMiddleware, generatePlan);

// Kontent rejani tasdiqlash
router.put("/:id/approve", authMiddleware, approveContentPlan);

// CRUD operatsiyalar
router.get("/", authMiddleware, getContentPlans);
router.get("/:id", authMiddleware, getContentPlanById);
router.put("/:id", authMiddleware, updateContentPlan);
router.delete("/:id", authMiddleware, deleteContentPlan);

module.exports = router;
