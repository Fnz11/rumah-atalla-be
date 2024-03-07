const {
  findAllFoods,
  findFoodById,
  insertFood,
  changeFood,
  deleteFoodById,
} = require("./foodServices");
const path = require("path");
const { Workbook } = require("exceljs");
const cloudinary = require("../utils/cloudinary");

//   GET ALL
const getAllFoods = async (req, res) => {
  try {
    const foods = await findAllFoods();
    return res.status(200).json(foods);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   GET ONE
const getFoodById = async (req, res) => {
  try {
    const { foodId } = req.params;
    const food = await findFoodById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    return res.status(200).json(food);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DOWNLOAD
const downloadFoodProductsData = async (req, res) => {
  try {
    const productsData = await findAllFoods();

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
      "Type",
      "Description",
      "Price",
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
        capitalize(data?.type),
        data?.description,
        "Rp. " + data?.price.toLocaleString(),
        data?.stock + " pcs",
      ]);
      applyStyling(dataRow);
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 30;
    }
    const excelBuffer = await workbook.xlsx.writeBuffer();
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: "foodsProducts.xlsx" },
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
const createFood = async (req, res) => {
  const foodData = req.body;
  try {
    if (foodData.imageUrl.url) {
      const result = await cloudinary.uploader.upload(foodData.imageUrl.url, {
        folder: "foods",
      });
      const newImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      foodData.imageUrl = newImage;
    }
    const newFood = await insertFood(foodData);
    return res.status(201).json(newFood);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   UPDATE
const updateFood = async (req, res) => {
  const { foodId } = req.params;
  const newData = req.body;
  try {
    if (newData.imageUrl.url) {
      const result = await cloudinary.uploader.upload(newData.imageUrl.url, {
        folder: "foods",
      });
      const newImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      newData.imageUrl = newImage;
    }
    const updatedFood = await changeFood(foodId, newData);
    if (!updatedFood) {
      return res.status(404).json({ message: "Food not found" });
    }
    return res.status(200).json(updatedFood);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//   DELETE
const deleteFood = async (req, res) => {
  try {
    const { foodId } = req.params;
    const deletedFood = await deleteFoodById(foodId);
    if (!deletedFood) {
      return res.status(404).json({ message: "Food not found" });
    }
    return res.status(200).json({ message: "Food deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  downloadFoodProductsData,
};
