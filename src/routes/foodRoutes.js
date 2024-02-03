const express = require("express");
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  downloadFoodProductsData,
} = require("../foods/foodControllers");
const { authenticateToken } = require("../middleware/requireAuth");

// GET all foods
router.get("/", getAllFoods);

// GET all foods
router.get("/data/download", downloadFoodProductsData);

// GET a specific food by ID
router.get("/:foodId", getFoodById);

// CREATE a new food
router.post("/", authenticateToken, createFood);

// UPDATE a food by ID
router.patch("/:foodId", authenticateToken, updateFood);

// DELETE a food by ID
router.delete("/:foodId", authenticateToken, deleteFood);

module.exports = router;
