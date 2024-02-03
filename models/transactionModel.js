const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  buyer: {
    type: String,
    required: true,
  },
  kasir: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["foods", "fashions"],
    required: true,
  },
  description: {
    type: String,
  },
  store: {
    type: String,
    default: "web",
  },
  products: [
    {
      productId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      cashback: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
      },
      promo: {
        type: [String],
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  totalWithDiscount: {
    type: Number,
    required: true,
  },
  totalCashback: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "successed", "canceled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
