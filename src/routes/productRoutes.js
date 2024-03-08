const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadFashionProductsData,
} = require("../products/productControllers");
const {
  authenticateTokenProductManager,
} = require("../middleware/requireAuthProductManager");

// GET ALL
router.get("/", getAllProducts);

// DOWNLOAD
router.get(
  "/data/download",
  authenticateTokenProductManager,
  downloadFashionProductsData
);

// GET ONE
router.get("/:productId", getProductById);

// CREATE
router.post("/", authenticateTokenProductManager, createProduct);

// UPDATE
router.patch("/:productId", authenticateTokenProductManager, updateProduct);

// DELETE
router.delete("/:productId", authenticateTokenProductManager, deleteProduct);

module.exports = router;
