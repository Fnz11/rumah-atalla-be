const {
  findAllTransactions,
  findTransactionById,
  insertTransaction,
  changeTransaction,
  // deleteTransactionById,
} = require("./transactionServices");
const path = require("path");
const { Workbook } = require("exceljs");
const admin = require("firebase-admin");
const serviceAccount = require("../credentials/ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await findAllTransactions();
    return res.status(200).json(transactions);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const downloadFoodsTransaction = async (req, res) => {
  try {
    const transactions = await findAllTransactions();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    const applyStyling = (row) => {
      row.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      };
    };

    const headerRow = worksheet.addRow([
      "ID",
      "Date",
      "Kasir",
      "Products",
      "Discount",
      "Price",
      "Total Price",
      "Cashback",
    ]);
    headerRow.font = { bold: true };
    applyStyling(headerRow);

    const formatCreatedAt = (createdAt) => {
      const dateObject = new Date(createdAt);
      return dateObject.toLocaleDateString();
    };

    transactions.forEach((transaction) => {
      if (transaction.type === "foods" && transaction.status === "successed") {
        const newProductsTransaction = transaction.products
          .map((product) => product.name)
          .join("\n");

        let Discount;
        if (transaction?.totalWithDiscount) {
          Discount = transaction?.totalWithDiscount - transaction?.totalAmount;
        } else {
          Discount = 0;
        }
        const dataRow = worksheet.addRow([
          transaction?._id?.toString(),
          formatCreatedAt(transaction.createdAt),
          transaction.kasir,
          newProductsTransaction,
          "Rp. " + Discount.toLocaleString(),
          "Rp. " + (transaction?.totalAmount ?? 0).toLocaleString(),
          "Rp. " +
            (
              transaction?.totalWithDiscount ?? transaction?.totalAmount
            ).toLocaleString(),
          "Rp. " + (transaction?.totalCashback ?? 0).toLocaleString(),
        ]);
        applyStyling(dataRow);
      }
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 30;
    }

    const excelPath = path.join(__dirname, "../excel/FoodsPromo.xlsx");
    await workbook.xlsx.writeFile(excelPath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=FoodsPromo.xlsx"
    );
    res.sendFile(excelPath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const downloadFashionsTransaction = async (req, res) => {
  try {
    const transactionsWeb = await findAllTransactions();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    const applyStyling = (row) => {
      row.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      };
    };

    const headerRow = worksheet.addRow([
      "ID",
      "Date",
      "Kasir",
      "Store",
      "Products",
      "Discount",
      "Price",
      "Total Price",
      "Cashback",
    ]);
    headerRow.font = { bold: true };
    applyStyling(headerRow);

    const formatCreatedAt = (createdAt) => {
      const dateObject = new Date(createdAt);
      return dateObject.toLocaleDateString();
    };

    transactionsWeb.forEach((transaction) => {
      if (
        transaction.type === "fashions" &&
        transaction.status === "successed"
      ) {
        const newProductsTransaction = transaction.products
          .map((product) => product.name)
          .join("\n");

        let Discount;
        if (transaction?.totalWithDiscount) {
          Discount = transaction?.totalWithDiscount - transaction?.totalAmount;
        } else {
          Discount = 0;
        }
        const capitalize = (str) => {
          return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const dataRow = worksheet.addRow([
          transaction?._id?.toString(),
          formatCreatedAt(transaction.createdAt),
          transaction.kasir,
          capitalize(transaction.store),
          newProductsTransaction,
          "Rp. " + Discount.toLocaleString(),
          "Rp. " + (transaction?.totalAmount ?? 0).toLocaleString(),
          "Rp. " +
            (
              transaction?.totalWithDiscount ?? transaction?.totalAmount
            ).toLocaleString(),
          "Rp. " + (transaction?.totalCashback ?? 0).toLocaleString(),
        ]);
        applyStyling(dataRow);
      }
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 30;
    }

    const excelPath = path.join(
      __dirname,
      "../excel/FashionsTransactions.xlsx"
    );
    await workbook.xlsx.writeFile(excelPath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=FashionsTransactions.xlsx"
    );
    res.sendFile(excelPath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await findTransactionById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.status(200).json(transaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transactionData = req.body;
    admin.messaging().send({
      notification: {
        title: "Transaksi Baru",
        body: "Ada transaksi baru di akun Anda",
      },
      topic: "owner_notifications",
    });
    console.log("CONTROL");
    const newTransaction = await insertTransaction(transactionData);
    return res.status(201).json(newTransaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const newData = req.body;
    const updatedTransaction = await changeTransaction(transactionId, newData);
    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.status(200).json(updatedTransaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// const deleteTransaction = async (req, res) => {
//   try {
//     const { transactionId } = req.params;
//     const deletedTransaction = await deleteTransactionById(transactionId);
//     if (!deletedTransaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }
//     return res.status(200).json({ message: "Transaction deleted successfully" });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  downloadFashionsTransaction,
  downloadFoodsTransaction,
  //   deleteTransaction,
};
