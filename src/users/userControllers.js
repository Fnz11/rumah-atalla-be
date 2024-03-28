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
const nodemailer = require("nodemailer");

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

    const excelBuffer = await workbook.xlsx.writeBuffer();
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", public_id: "usersData.xlsx" },
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

    // Cari pengguna berdasarkan email
    const user = await findUserByEmail(email);
    if (user.length == 0) {
      return res.status(404).json({ message: "User not found" });
    }
    // Bandingkan password yang dimasukkan dengan password yang di-hash
    // console.log(password, user[0].password);
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
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

// EMAIL TEXT
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rumahatalla365@gmail.com",
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendResetPasswordEmail = async (email, token) => {
  try {
    // Send mail with defined transport object
    await transporter.sendMail({
      from: "rumahatalla365@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `To reset your password, please click on the following link: http://localhost:5173/reset-password/?token=${token}&email=${email}`,
      html: `<p>To reset your password, please click on the following link: <a href="http://localhost:5173/reset-password/?token=${token}&email=${email}">Reset Password</a></p>`,
    });

    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Error sending password reset email");
  }
};

const generateUniqueToken = async ({ email }) => {
  try {
    const saltRounds = 10;
    const expirationTime = 60 * 60 * 1000; // 60 minutes in milliseconds

    const dateNow = Date.now();
    const randomString = `${email}.${dateNow}`;

    const token = await bcrypt.hash(randomString, saltRounds);

    // Calculate expiration time
    const expirationDate = new Date(dateNow + expirationTime);

    return { token, expirationDate };
  } catch (error) {
    console.error("Error generating unique token:", error);
    throw new Error("Error generating unique token");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { token, expirationDate } = await generateUniqueToken({ email });

    storeData = {
      resetPasswordToken: {
        token: token,
        expirationDate: expirationDate,
      },
    };
    await changeUser(user[0]._id, storeData);

    await sendResetPasswordEmail(email, token);

    return res
      .status(200)
      .json({ message: "Reset password instructions sent to your email" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, email, token } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user[0].resetPasswordToken) {
      return res.status(401).json({ message: "Token not found" });
    }

    const dateNow = Date.now();
    // const expirationDate = new Date(user.resetPasswordToken.expirationDate);
    // if (dateNow > expirationDate) {
    //   return res.status(401).json({ message: "Token expired" });
    // }
    const isValidToken = token == user[0].resetPasswordToken.token;
    console.log(newPassword, email, token, user[0]);
    
    if (!isValidToken) {
      console.log("test")
      return res.status(401).json({ message: "Invalid token" });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await changeUser(user[0]._id, {
      resetPasswordToken: null,
      password: hashedPassword,
    });

    return res.status(200).json({ token: user.resetPasswordToken });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  let updatedData = req.body;
  try {
    if (updatedData?.password) {
      if (updatedData.password === "") {
        const { password, ...updatedDataWithoutPassword } = updatedData;
        updatedData = updatedDataWithoutPassword;
      } else {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        updatedData.password = await bcrypt.hash(updatedData.password, salt);
      }
    }
    console.log(updatedData);
    if (updatedData?.imageUrl?.url) {
      const result = await cloudinary.uploader.upload(
        updatedData.imageUrl.url,
        {
          folder: "users",
        }
      );
      const newImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
      updatedData.imageUrl = newImage;
    }
    if (updatedData?.email && !validator.isEmail(updatedData?.email)) {
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
  forgotPassword,
  resetPassword,
};
