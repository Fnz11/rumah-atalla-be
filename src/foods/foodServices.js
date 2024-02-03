const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} = require("./foodRepositorys");

const findAllFoods = async () => {
  return await getAllFoods();
};

const findFoodById = async (foodId) => {
  return await getFoodById(foodId);
};

const insertFood = async (foodData) => {
  return await createFood(foodData);
};

const changeFood = async (foodId, newData) => {
  return await updateFood(foodId, newData);
};

const deleteFoodById = async (foodId) => {
  return await deleteFood(foodId);
};

module.exports = {
  findAllFoods,
  findFoodById,
  insertFood,
  changeFood,
  deleteFoodById,
};
