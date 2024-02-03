const Transaction = require("../../models/transactionModel");

const getAllTransactions = async () => {
  return await Transaction.find({});
};

const getTransactionById = async (transactionId) => {
  return await Transaction.findById(transactionId);
};

const createTransaction = async (transactionData) => {
  // console.log("REPPPP", transactionData)
  return await Transaction.create(transactionData);
};

const updateTransaction = async (transactionId, newData) => {
  return await Transaction.findByIdAndUpdate(transactionId, newData, { new: true });
};

// const deleteTransaction = async (transactionId) => {
//   return await Transaction.findByIdAndDelete(transactionId);
// };

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
//   deleteTransaction,
};
