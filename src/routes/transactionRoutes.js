const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  downloadFashionsTransaction,
  downloadFoodsTransaction
  //   deleteTransaction,
} = require("../transactions/transactionControllers");
const { authenticateToken } = require("../middleware/requireAuth");

// GET ALL
router.get("/", authenticateToken, getAllTransactions);

// GET ONE
router.get("/:transactionId", authenticateToken, getTransactionById);

// CREATE
router.post("/",authenticateToken, createTransaction);

// DOWNLOAD FASHIONS
router.get("/fashions/download", downloadFashionsTransaction);

// DOWNLOAD FOODS
router.get("/foods/download", downloadFoodsTransaction);

// // UPDATE
router.patch("/:transactionId",authenticateToken, updateTransaction);

// // DELETE
// router.delete("/:transactionId", deleteTransaction);

module.exports = router;
