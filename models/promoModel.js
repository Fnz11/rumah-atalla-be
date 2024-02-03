const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const promoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  products: {
    type: [String],
  },
  type: {
    type: String,
    enum: [
      "cashback persentase",
      "cashback nominal",
      "diskon persentase",
      "diskon nominal",
    ],
    required: true,
  },
  for: {
    type: String,
    enum: ["fashions", "foods"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  date: {
    startDate: Date,
    endDate: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: String,
});

const Promo = mongoose.model("Promo", promoSchema);

module.exports = Promo;
