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
const { authenticateToken } = require("../middleware/requireAuth");

// GET ALL
router.get("/", getAllProducts);

// GET ALL
router.get("/data/download", downloadFashionProductsData);

// GET ONE
router.get("/:productId", getProductById);

// CREATE
router.post("/", createProduct);

// UPDATE
router.patch("/:productId", authenticateToken, updateProduct);

// DELETE
router.delete("/:productId", authenticateToken, deleteProduct);

module.exports = router;
