const {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    // deleteTransaction,
  } = require("./transactionRepositorys");
  
  const findAllTransactions = async () => {
    return await getAllTransactions();
  };
  
  const findTransactionById = async (transactionId) => {
    return await getTransactionById(transactionId);
  };
  
  const insertTransaction = async (transactionData) => {
    return await createTransaction(transactionData);
  };
  
  const changeTransaction = async (transactionId, newData) => {
    return await updateTransaction(transactionId, newData);
  };
  
  // const deleteTransactionById = async (transactionId) => {
  //   return await deleteTransaction(transactionId);
  // };
  
  module.exports = {
    findAllTransactions,
    findTransactionById,
    insertTransaction,
    changeTransaction,
    // deleteTransactionById,
  };
  