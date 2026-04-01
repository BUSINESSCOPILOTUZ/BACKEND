const router = require("express").Router();
const {
  getInfluencers,
  getInfluencerById,
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
  findByPromoCode,
} = require("../controller/influencerController");
const { authMiddleware } = require("../middleware/auth");

// Promokod tekshirish (public - auth kerak emas)
router.get("/promo/:code", findByPromoCode);

// Barcha qolgan routelar auth talab qiladi
router.use(authMiddleware);

// CRUD operatsiyalar
router.get("/", getInfluencers);
router.get("/:id", getInfluencerById);
router.post("/", createInfluencer);
router.put("/:id", updateInfluencer);
router.delete("/:id", deleteInfluencer);

module.exports = router;
