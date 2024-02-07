const {
  findAllTransactions,
  findTransactionById,
  insertTransaction,
  changeTransaction,
  // deleteTransactionById,
} = require("./transactionServices");
const { changeFood } = require("../foods/foodServices");
const {
  changeProduct,
  findProductById,
} = require("../products/productServices");
const path = require("path");
const { Workbook } = require("exceljs");
const admin = require("firebase-admin");
const serviceAccount = require("../credentials/serviceAccountKey.json");

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
    if (transactionData?.type === "foods") {
      transactionData?.products?.map(async (product) => {
        const newProduct = await changeFood(product.productId, {
          stock: product.stock - product.qty,
        });
        return newProduct;
      });
    } else if (transactionData?.type === "fashions") {
      // NEW PRODUCTS
      let newProducts = [];
      // MAPPING PRODUCTS BOUGHT
      transactionData?.products?.map((product) => {
        // NEW STOCK
        const newStock = product?.stock - product?.qty;

        // NEW SIZE THAT HAS NEW STOCK
        const newSize = {
          ...product?.sizes[product?.indexSize],
          stock: newStock,
        };

        // NEW SIZES THAT HAS NEW SIZE BEFORE
        const newSizes = [...product?.sizes];
        newSizes[product?.indexSize] = newSize;

        // CHECK IF PRODUCT ALREADY EXISTS ON NEW PRODUCTS
        const isExist = newProducts.find(
          (newProduct) => newProduct?.productId === product?.productId
        );

        // IF PRODUCT ALREADY EXISTS
        if (isExist) {
          // FIND INDEX OF PRODUCT
          const indexProduct = newProducts.findIndex(
            (newProduct) => newProduct?.productId === product?.productId
          );

          // CHECK IF VARIANT ALREADY EXISTS
          const isExistVariant = newProducts[indexProduct]?.variants?.find(
            (variant) =>
              variant?.name === product?.variants[product?.indexVariant]?.name
          );

          // IF VARIANT ALREADY EXISTS
          if (isExistVariant) {
            // FIND INDEX OF VARIANT
            const indexVar = newProducts[indexProduct]?.variants?.findIndex(
              (variant) =>
                variant?.name === product?.variants[product?.indexVariant]?.name
            );

            // console.log(
            //   "TEST DISINI",
            //   newProducts[indexProduct]?.variants[0]?.name,
            //   indexVar,
            //   product?.variants[product?.indexVariant]?.name
            //   // product?.variants[product?.indexVariant]?.name,
            //   // product?.sizes[product?.indexSize]?.size
            // );

            // UPDATE VARIANT WITH NEW SIZE
            const updatedVariant = {
              ...newProducts[indexProduct]?.variants[indexVar],
              size: [
                ...newProducts[indexProduct]?.variants[indexVar]?.size,
                newSize,
              ],
            };
            // console.log(
            //   "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBN",
            //   newProducts[indexProduct]?.variants
            // );
            // UPDATE PRODUCT WITH UPDATED VARIANT
            if (
              newProducts[indexProduct] &&
              newProducts[indexProduct].variants
            ) {
              newProducts[indexProduct].variants[indexVar] = updatedVariant;
            }
          }

          // IF VARIANT DOSENT EXISTS
          else {
            // MAKE NEW VARIANT
            const newVariant = {
              ...product?.variants[product?.indexVariant],
              size: newSizes,
            };

            // ADD NEW VARIANT
            newProducts[indexProduct]?.variants.push(newVariant);
          }
        }
        // IF PRODUCT DOESNT EXIST
        else {
          // MAKE NEW PRODUCT
          const newVariant = {
            ...product?.variants[product?.indexVariant],
            size: newSizes,
          };

          console.log("INI NEW SIZE", newVariant);
          console.log("NENEW1", newProducts);

          // ADD NEW PRODUCT WITH OLD VARIANTS
          newProducts.push({
            productId: product?.productId,
            oldVariants: product?.variants,
            variants: [newVariant],
          });
          console.log("NENEW2", newProducts[0].variants[0]);
        }
        // console.log("NENEW", newProducts[0]?.variants[0]?.size[0]);
        return newProducts;
      });

      // UPDATE PRODUCTS
      const updateProducts = newProducts.map(async (product) => {
        // MERGE NEW VARIANTS AND OLD VARIANTS

        let newVariants = [...product?.variants];
        product?.oldVariants.map((oldVariant) => {
          const isExist = newVariants.find(
            (newVariant) => newVariant?.name === oldVariant?.name
          );
          if (!isExist) {
            newVariants.push(oldVariant);
          }
        });

        // const newVariants =

        // UPDATE PRODUCT
        const newProduct = await changeProduct(product.productId, {
          variants: newVariants,
        });
        return newProduct;
      });

      await Promise.all(updateProducts);
    }
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
