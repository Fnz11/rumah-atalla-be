const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["foods", "drinks"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Food = mongoose.model("Food", foodSchema);

module.exports = Food;
