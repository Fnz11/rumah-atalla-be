const {
  findAllProducts,
  findProductById,
  insertProduct,
  changeProduct,
  deleteProductById,
} = require("./productServices");
const path = require("path");
const { Workbook } = require("exceljs");

//   GET ALL
const getAllProducts = async (req, res) => {
  try {
    const products = await findAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   GET ONE
const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await findProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DOWNLOAD
const downloadFashionProductsData = async (req, res) => {
  try {
    const productsData = await findAllProducts();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Fashions Products");

    const applyStyling = (row) => {
      row.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      };
    };

    const headerRow = worksheet.addRow([
      "ID",
      "Create At",
      "Name",
      "Description",
      "Price",
      "Store",
      "Stock",
    ]);
    headerRow.font = { bold: true };
    applyStyling(headerRow);

    const formatCreatedAt = (createdAt) => {
      const dateObject = new Date(createdAt);
      return dateObject.toLocaleDateString();
    };

    const capitalize = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    productsData.forEach((data) => {
      const dataRow = worksheet.addRow([
        data?._id?.toString(),
        formatCreatedAt(data.createdAt),
        data?.name,
        data?.description,
        "Rp. " + data?.price.toLocaleString(),
        capitalize(data?.store),
        data?.stock + " pcs",
      ]);
      applyStyling(dataRow);
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 30;
    }

    const excelPath = path.join(__dirname, "../excel/FashionProductsData.xlsx");
    await workbook.xlsx.writeFile(excelPath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=FashionProductsData.xlsx"
    );
    res.sendFile(excelPath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   CREATE
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await insertProduct(productData);
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   UPDATE
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const newData = req.body;
    const updatedProduct = await changeProduct(productId, newData);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   DELETE
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await deleteProductById(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadFashionProductsData,
};
