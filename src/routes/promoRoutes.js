const express = require("express");
const router = express.Router();
const {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  downloadFashionsPromo,
  downloadFoodsPromo
} = require("../promo/promoControllers");
const { authenticateTokenOwner } = require("../middleware/requireAuthOwner");
const { authenticateToken } = require("../middleware/requireAuth");

// GET ALL
router.get("/", authenticateToken, getAllPromos);

// DOWNLOAD FASHIONS
router.get("/fashions/download", downloadFashionsPromo);

// DOWNLOAD FOODS
router.get("/foods/download", downloadFoodsPromo);

// GET ONE
router.get("/:promoId", authenticateToken, getPromoById);

// CREATE
router.post("/", createPromo);

// UPDATE
router.patch("/:promoId", authenticateTokenOwner, updatePromo);

// DELETE
router.delete("/:promoId", authenticateTokenOwner, deletePromo);

module.exports = router;
