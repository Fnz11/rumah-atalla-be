const Food = require("../../models/foodModel");

// GET
const getAllFoods = async () => {
  return await Food.find({});
};

// GET ONE
const getFoodById = async (foodId) => {
  return await Food.findById(foodId);
};

// CREATE
const createFood = async (foodData) => {
  return await Food.create(foodData);
};

// UPDATE
const updateFood = async (foodId, newData) => {
  return await Food.findByIdAndUpdate(foodId, newData, { new: true });
};

// DELETE
const deleteFood = async (foodId) => {
  return await Food.findByIdAndDelete(foodId);
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};
