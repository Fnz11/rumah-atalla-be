const {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
} = require("./promoRepositorys");

const findAllPromos = async () => {
  return await getAllPromos();
};

const findPromoById = async (promoId) => {
  return await getPromoById(promoId);
};

const insertPromo = async (promoData) => {
  return await createPromo(promoData);
};

const changePromo = async (promoId, newData) => {
  return await updatePromo(promoId, newData);
};

const deletePromoById = async (promoId) => {
  return await deletePromo(promoId);
};

module.exports = {
  findAllPromos,
  findPromoById,
  insertPromo,
  changePromo,
  deletePromoById,
};
