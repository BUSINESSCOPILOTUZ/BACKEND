const router = require("express").Router();
const {
  getContentPlans,
  getContentPlanById,
  generatePlan,
  updateContentPlan,
  deleteContentPlan,
  approveContentPlan,
} = require("../controller/contentPlanController");

// Barcha routelar PUBLIC (auth shart emas — frontend to'g'ridan-to'g'ri chaqiradi)

// AI orqali kontent reja generatsiya qilish
router.post("/generate", generatePlan);

// Kontent rejani tasdiqlash
router.put("/:id/approve", approveContentPlan);

// CRUD operatsiyalar
router.get("/", getContentPlans);
router.get("/:id", getContentPlanById);
router.put("/:id", updateContentPlan);
router.delete("/:id", deleteContentPlan);

module.exports = router;
