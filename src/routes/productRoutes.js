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
const { authenticateTokenOwner } = require("../middleware/requireAuthOwner");

// GET ALL
router.get("/", getAllProducts);

// DOWNLOAD
router.get(
  "/data/download",
  authenticateTokenOwner,
  downloadFashionProductsData
);

// GET ONE
router.get("/:productId", getProductById);

// CREATE
router.post("/", authenticateTokenOwner, createProduct);

// UPDATE
router.patch("/:productId", authenticateTokenOwner, updateProduct);

// DELETE
router.delete("/:productId", authenticateTokenOwner, deleteProduct);

module.exports = router;
