const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const {
  findAllUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  changeUser,
  deleteUserById,
} = require("./userServices");
const path = require("path");
const { Workbook } = require("exceljs");
const cloudinary = require("../utils/cloudinary");

const SALT_ROUNDS = 10;

const getAllUsers = async (req, res) => {
  try {
    const users = await findAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const user = await findUserByEmail(userEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const downloadUsersData = async (req, res) => {
  try {
    const users = await findAllUsers();

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Users Data");
    const applyStyling = (row) => {
      row.alignment = {
        wrapText: true,
        vertical: "middle",
        horizontal: "center",
      };
    };

    const headerRow = worksheet.addRow([
      "ID",
      "Join",
      "Username",
      "Email",
      "Role",
      "Number",
      "Successed Transaction",
      "Pending Transaction",
      "Canceled Transaction",
      "Total Transaction",
    ]);
    headerRow.font = { bold: true };
    applyStyling(headerRow);

    const formatCreatedAt = (createdAt) => {
      const dateObject = new Date(createdAt);
      return dateObject.toLocaleDateString();
    };

    users.forEach((user) => {
      let totalTransaction;
      totalTransaction =
        user?.transactions?.successed +
        user?.transactions?.pending +
        user?.transactions?.canceled;

      const dataRow = worksheet.addRow([
        user?._id?.toString(),
        formatCreatedAt(user.createdAt),
        user?.username,
        user?.email,
        user?.role,
        user?.number,
        user?.transactions?.successed,
        user?.transactions?.pending,
        user?.transactions?.canceled,
        totalTransaction,
      ]);
      applyStyling(dataRow);
    });

    const numColumns = worksheet.columns.length;
    for (let i = 1; i <= numColumns; i++) {
      worksheet.getColumn(i).width = 30;
    }

    const excelPath = path.join(__dirname, "../excel/UsersData.xlsx");
    await workbook.xlsx.writeFile(excelPath);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=UsersData.xlsx");
    res.sendFile(excelPath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteUserById(userId);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("WOIOWIOIOIO", email, password);

    // Cari pengguna berdasarkan email
    const user = await findUserByEmail(email);
    if (user.length == 0) {
      return res.status(404).json({ message: "User not found" });
    }
    // Bandingkan password yang dimasukkan dengan password yang di-hash
    // console.log(password, user[0].password);
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    // if (!isValidPassword) {
    // return res.status(401).json({ message: "Invalid credentials" });
    // }
    console.log(user);
    // Buat token JWT untuk autentikasi
    const token = jwt.sign(
      { userId: user[0]._id, username: user[0].username, role: user[0].role },
      "mamaraffi",
      {
        expiresIn: "9999h",
      }
    );

    // Kirim token sebagai respons
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const validateToken = async (req, res) => {
  try {
    const { token } = req.params;

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "mamaraffi");
      console.log(decodedToken);
    } catch (error) {
      console.log(error);
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!decodedToken) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Kirim data pengguna yang valid dalam respons
    return res.status(200).json({ decodedToken });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const userData = req.body;
  try {
    if (userData.imageUrl.url) {
      const result = await cloudinary.uploader.upload(userData.imageUrl.url, {
        folder: "users",
      });
      const newImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      userData.imageUrl = newImage;
    }
    if (userData.email && !validator.isEmail(userData.email)) {
      throw new Error("Email tidak valid");
    }
    const salt = await bcrypt.genSalt(SALT_ROUNDS);

    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const newUser = await insertUser({ ...userData, password: hashedPassword });
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const updatedData = req.body;
  try {
    if (updatedData.imageUrl.url) {
      const result = await cloudinary.uploader.upload(updatedData.imageUrl.url, {
        folder: "users",
      });
      const newImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      updatedData.imageUrl = newImage;
    }
    if (updatedData.email && !validator.isEmail(updatedData.email)) {
      throw new Error("Email tidak valid");
    }
    const updatedUser = await changeUser(userId, updatedData);
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  signInUser,
  validateToken,
  downloadUsersData,
};
