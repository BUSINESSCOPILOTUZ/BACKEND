const router = require("express").Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addMessage,
  exportLeads,
} = require("../controller/leadController");
const { authMiddleware } = require("../middleware/auth");

// Barcha routelar auth talab qiladi
router.use(authMiddleware);

// Lidlarni eksport qilish (Excel)
router.get("/export", exportLeads);

// CRUD operatsiyalar
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.post("/", createLead);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);

// Lidga xabar qo'shish
router.post("/:id/messages", addMessage);

module.exports = router;
