const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("./productRepositorys");

// GET ALL
const findAllProducts = async () => {
  return await getAllProducts();
};

// GET ONE
const findProductById = async (productId) => {
  return await getProductById(productId);
};

// CREATE
const insertProduct = async (productData) => {
  return await createProduct(productData);
};

// UPDATE
const changeProduct = async (productId, newData) => {
  // console.log("UPDATE", productId, newData);
  return await updateProduct(productId, newData);
};

// DELETE
const deleteProductById = async (productId) => {
  return await deleteProduct(productId);
};

module.exports = {
  findAllProducts,
  findProductById,
  insertProduct,
  changeProduct,
  deleteProductById,
};
