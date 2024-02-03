const Promo = require("../../models/promoModel");

const getAllPromos = async () => {
  return await Promo.find({});
};

const getPromoById = async (promoId) => {
  return await Promo.findById(promoId);
};

const createPromo = async (promoData) => {
  return await Promo.create(promoData);
};

const updatePromo = async (promoId, newData) => {
  return await Promo.findByIdAndUpdate(promoId, newData, { new: true });
};

const deletePromo = async (promoId) => {
  return await Promo.findByIdAndDelete(promoId);
};

module.exports = {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
};
