const {
  findAllTransactions,
  findTransactionById,
  insertTransaction,
  changeTransaction,
  // deleteTransactionById,
} = require("./transactionServices");
const { changeFood } = require("../foods/foodServices");
const { changeProduct } = require("../products/productServices");
const { findUserById, changeUser } = require("../users/userServices");
const path = require("path");
const { Workbook } = require("exceljs");
const { sendNotification } = require("../utils/firebase.js");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require("twilio");
const client = new twilio(accountSid, authToken);
const cloudinary = require("cloudinary").v2;

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
      "Kustomer",
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
          transaction.buyer,
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

    // Write Excel file to buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    console.log("TEST");
    // Upload Excel file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: "FoodsTransactions.xlsx" },
      (error, result) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ error: "Failed to upload file to Cloudinary" });
        }
        console.log("RES URL", result.secure_url);
        // Return Cloudinary URL as response
        res.status(200).json({ fileUrl: result.secure_url });
      }
    );
    cloudinaryResponse.end(excelBuffer);
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
      "Kustomer",
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
          .map(
            (product) =>
              product.name + ", " + product.qty + ", " + product.discount
          )
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
          transaction.buyer,
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

    // Menulis file Excel ke buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    console.log("TETEEEEEZZZT");

    // Upload file Excel ke Cloudinary dengan menambahkan ekstensi .xlsx ke nama file
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: "FashionsTransactions.xlsx" },
        async (error, result) => {
          if (error) {
            console.error(error);
            return res
              .status(500)
              .json({ error: "Failed to upload file to Cloudinary" });
          }

          // Set header dan kirim URL Cloudinary sebagai respons
          res.status(200).json({ fileUrl: result.secure_url });
        }
      )
      .end(excelBuffer);
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

const sendWhatsAppMessage = async (to, message) => {
  try {
    client.messages
      .create({
        body: message,
        from: "whatsapp:+14155238886",
        to: "whatsapp:" + to,
      })
      .then((message) => console.log(message.sid));
  } catch (error) {
    console.error(`Failed to send message: ${error}`);
  }
};

const sendNotificationFirebase = async (transactionData) => {
  let finalAmount = transactionData?.totalAmount;
  if (transactionData?.totalWithDiscount) {
    finalAmount = transactionData?.totalWithDiscount;
  }
  if (transactionData?.totalCashback) {
    finalAmount -= transactionData?.totalCashback;
  }
  finalAmount = "Rp. " + finalAmount.toLocaleString();
  sendNotification({
    title: "New transaction - " + transactionData?.kasir,
    body: transactionData.buyer + " - " + finalAmount,
  });
};

// sendWhatsAppMessage("+6283175022933", "Hello from Twilio WhatsApp API!");

const createTransaction = async (req, res) => {
  const transactionData = req.body;
  try {
    let message = `*Buyer: ${transactionData.buyer}*\n`;
    message += `*Kasir: ${transactionData.kasir}*\n`;
    transactionData.products.forEach((product, index) => {
      let isDiscount = product.price !== product.discount;
      let isCashback = product.cashback !== 0;
      let price = product.price / product.qty;
      let discount = (product.discount - product.price) / product.qty;
      let cashback = product.cashback / product.qty;
      if (isDiscount) {
        price = product.discount / product.qty;
      }
      message += `\n${index + 1}. ${
        product.name
      } - Rp ${price.toLocaleString()}${
        isDiscount ? " (Diskon Rp " + discount.toLocaleString() + ")" : ""
      }${
        isCashback ? " (Cashback +Rp " + cashback.toLocaleString() + ")" : ""
      }, Qty: ${product.qty}, *Total: Rp ${(
        price * product.qty
      ).toLocaleString()}*\n`;
    });
    if (transactionData.totalCashback > 0) {
      message += `\nCashback: +Rp ${transactionData.totalCashback.toLocaleString()}\n`;
    }
    if (transactionData.totalDiscount > 0) {
      message += `\nDiskon: -Rp ${(
        transactionData.totalDiscount - transactionData.totalAmount
      ).toLocaleString()}\n`;
      message += `\nNormal: Rp ${transactionData.totalAmount.toLocaleString()}\n`;
    }
    message += `\n*Total: Rp ${transactionData.totalWithDiscount.toLocaleString()}*\n`;
    sendWhatsAppMessage("+6283175022933", message); // Replace with your phone number
    sendNotificationFirebase(transactionData);

    // UPDATE STCOK PRODUCT
    if (transactionData?.type === "foods") {
      console.log("DADA", transactionData);
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

            // UPDATE VARIANT WITH NEW SIZE
            if (newProducts[indexProduct]?.variants[indexVar]) {
              newProducts[indexProduct].variants[indexVar].size[
                product.indexSize
              ] = newSize;
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
            (newVariant) => newVariant?._id === oldVariant?._id
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

    // UPDATE TRANSACTION IN KASIR
    const kasirData = await findUserById(transactionData?.kasirId);
    if (kasirData?.transactions?.pending) {
      const newKasirTransactions = kasirData?.transactions;
      newKasirTransactions.pending++;
      console.log("NEW KASIR TRANSACTION", newKasirTransactions);
      const newKasirData = kasirData;
      newKasirData.transactions = newKasirTransactions;

      console.log("NEW KASIR DATA", newKasirData);
      await changeUser(kasirData?._id, newKasirData);
    }

    // INSERT TRANSACTION
    const newTransaction = await insertTransaction(transactionData);
    return res.status(201).json(newTransaction);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const newData = req.body;
  // UPDATE TRANSACTION
  const updatedTransactionData = {
    status: newData.status,
  };

  try {
    // CHECK IF KASIR VALID
    const oldTransaction = await findTransactionById(transactionId);
    if (oldTransaction?.kasirId && newData?.kasirId) {
      if (oldTransaction?.kasirId != newData?.kasirId) {
        return res
          .status(400)
          .json({ message: "Transaction cannot be updated" });
      }
    } else {
      if (oldTransaction?.kasir !== newData?.kasir) {
        return res
          .status(400)
          .json({ message: "Transaction cannot be updated" });
      }
    }

    // UPDATE TRANSACTION IN KASIR
    const kasirData = await findUserById(newData?.kasirId);
    const newKasirTransactions = kasirData?.transactions;
    if (oldTransaction?.status === "pending") {
      newKasirTransactions.pending--;
    } else if (oldTransaction?.status === "success") {
      newKasirTransactions.success--;
    } else if (oldTransaction?.status === "failed") {
      newKasirTransactions.failed--;
    }
    if (updatedTransactionData.status === "pending") {
      newKasirTransactions.pending++;
    } else if (updatedTransactionData.status === "success") {
      newKasirTransactions.success++;
    } else if (updatedTransactionData.status === "failed") {
      newKasirTransactions.failed++;
    }
    const newKasirData = kasirData;
    newKasirData.transactions = newKasirTransactions;
    await changeUser(kasirData?._id, newKasirData);

    const updatedTransaction = await changeTransaction(
      transactionId,
      updatedTransactionData
    );
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
