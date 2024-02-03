const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  // price: {
  //   type: Number,
  //   required: true,
  // },
  store: {
    type: String,
    default: "web",
    required: true,
  },
  // stock: {
  //   type: Number,
  //   required: true,
  // },
  brand: {
    type: String,
  },
  imageUrl: [
    {
      name: { type: String },
      url: { type: String },
    },
  ],
  variants: [
    {
      name: { type: String },
      description: { type: String },
      size: [
        {
          size: { type: String },
          price: { type: Number },
          stock: { type: Number },
        },
      ],
    },
  ],
  // status: {
  //   type: String,
  //   enum: ["publik", "arsip"],
  //   required: true,
  //   default: "publik",
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
