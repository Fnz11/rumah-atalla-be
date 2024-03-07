const {
  findAllProducts,
  findProductById,
  insertProduct,
  changeProduct,
  deleteProductById,
} = require("./productServices");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
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
    console.log(productsData);
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

    productsData.forEach((product) => {
      product.variants.forEach((variant) => {
        variant.size.forEach((s) => {
          const dataRow = worksheet.addRow([
            product?._id?.toString(),
            formatCreatedAt(product.createdAt),
            product?.name + " - " + variant.name + " - " + s.size,
            product?.description,
            "Rp. " + s?.price.toLocaleString(),
            capitalize(product?.store),
            s?.stock + " pcs",
          ]);
          applyStyling(dataRow);
        });
      });
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 35;
    }
    console.log("tessssss")
    const excelBuffer = await workbook.xlsx.writeBuffer();
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: "FashionsProducts.xlsx" },
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

//   CREATE
const createProduct = async (req, res) => {
  const productData = req.body;
  let newImageUrl = [...productData.imageUrl];

  try {
    const uploadToCloudinary = productData.imageUrl.map(
      async (image, index) => {
        if (image.url) {
          try {
            const result = await cloudinary.uploader.upload(image.url, {
              folder: "fashions",
            });
            newImageUrl[index].url = result.secure_url;
            newImageUrl[index].public_id = result.public_id;
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        }
      }
    );
    await Promise.all(uploadToCloudinary);
    productData.imageUrl = newImageUrl;

    const newProduct = await insertProduct(productData);
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   UPDATE
const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const newData = req.body;
  let newImageUrl = [...newData.imageUrl];

  try {
    const uploadToCloudinary = newData.imageUrl.map(async (image, index) => {
      if (image.url) {
        try {
          const result = await cloudinary.uploader.upload(image.url, {
            folder: "fashions",
          });
          newImageUrl[index].url = result.secure_url;
          newImageUrl[index].public_id = result.public_id;
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    });
    await Promise.all(uploadToCloudinary);
    newData.imageUrl = newImageUrl;

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
