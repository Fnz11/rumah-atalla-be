const {
  findAllPromos,
  findPromoById,
  insertPromo,
  changePromo,
  deletePromoById,
} = require("./promoServices");
const path = require("path");
const { Workbook } = require("exceljs");
const cloudinary = require("../utils/cloudinary");

const getAllPromos = async (req, res) => {
  try {
    const promos = await findAllPromos();
    return res.status(200).json(promos);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPromoById = async (req, res) => {
  try {
    const { promoId } = req.params;
    const promo = await findPromoById(promoId);
    if (!promo) {
      return res.status(404).json({ message: "Promo not found" });
    }
    return res.status(200).json(promo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const downloadFashionsPromo = async (req, res) => {
  try {
    const promos = await findAllPromos();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Promo Data");

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
      "Products",
      "Type",
      "Value",
      "Date",
    ]);
    headerRow.font = { bold: true };
    applyStyling(headerRow);

    const formatDate = (createdAt) => {
      const dateObject = new Date(createdAt);
      return dateObject.toLocaleDateString();
    };

    promos.forEach((promo) => {
      if (promo.for === "fashions") {
        const newPromo = promo?.products.map((product) => product).join("\n");

        let Date =
          formatDate(promo?.date.startDate) +
          " - " +
          formatDate(promo?.date.endDate);
        const capitalize = (str) => {
          return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const dataRow = worksheet.addRow([
          promo?._id?.toString(),
          formatDate(promo.createdAt),
          promo?.name,
          newPromo,
          capitalize(promo?.type),
          promo?.value,
          Date,
        ]);
        applyStyling(dataRow);
      }
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 30;
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: "FashionsPromos.xlsx" },
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
const downloadFoodsPromo = async (req, res) => {
  try {
    const promos = await findAllPromos();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Promo Data");

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
      "Products",
      "Type",
      "Value",
      "Date",
    ]);
    headerRow.font = { bold: true };
    applyStyling(headerRow);

    const formatDate = (createdAt) => {
      const dateObject = new Date(createdAt);
      return dateObject.toLocaleDateString();
    };

    promos.forEach((promo) => {
      if (promo.for === "foods") {
        const newPromo = promo?.products.map((product) => product).join("\n");

        let Date =
          formatDate(promo?.date.startDate) +
          " - " +
          formatDate(promo?.date.endDate);
        const capitalize = (str) => {
          return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const dataRow = worksheet.addRow([
          promo?._id?.toString(),
          formatDate(promo.createdAt) || "-",
          promo?.name,
          newPromo,
          capitalize(promo?.type),
          promo?.value,
          Date,
        ]);
        applyStyling(dataRow);
      }
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 30;
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: "FoodsPromos.xlsx" },
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

const createPromo = async (req, res) => {
  const promoData = req.body;
  try {
    if (promoData.imageUrl.url) {
      const result = await cloudinary.uploader.upload(promoData.imageUrl.url, {
        folder: "promos",
      });
      const newImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      promoData.imageUrl = newImage;
    }
    const newPromo = await insertPromo(promoData);
    return res.status(201).json(newPromo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updatePromo = async (req, res) => {
  const { promoId } = req.params;
  const newData = req.body;
  try {
    console.log(newData.imageUrl);
    if (newData.imageUrl.url) {
      const result = await cloudinary.uploader.upload(newData.imageUrl.url, {
        folder: "promos",
      });
      const newImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      newData.imageUrl = newImage;
    }
    const updatedPromo = await changePromo(promoId, newData);
    if (!updatedPromo) {
      return res.status(404).json({ message: "Promo not found" });
    }
    return res.status(200).json(updatedPromo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deletePromo = async (req, res) => {
  try {
    const { promoId } = req.params;
    const deletedPromo = await deletePromoById(promoId);
    if (!deletedPromo) {
      return res.status(404).json({ message: "Promo not found" });
    }
    return res.status(200).json({ message: "Promo deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  downloadFashionsPromo,
  downloadFoodsPromo,
};
