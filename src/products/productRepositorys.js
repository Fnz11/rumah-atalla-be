const Product = require("../../models/productModel");

// GET ALL
const getAllProducts = async () => {
  return await Product.find({});
};

//   GET BY ID
const getProductById = async (productId) => {
  return await Product.findById(productId);
};

//   CREATE
const createProduct = async (productData) => {
  console.log("CREATE", productData)
  return await Product.create(productData);
};

//   UPDATE
const updateProduct = async (productId, newData) => {
  return await Product.findByIdAndUpdate(productId, newData, { new: true });
};

//   DELETE
const deleteProduct = async (productId) => {
  return await Product.findByIdAndDelete(productId);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
