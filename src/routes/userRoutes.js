const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  signInUser,
  downloadUsersData,
  validateToken,
  forgotPassword,
  resetPassword,
} = require("../users/userControllers");
const { authenticateToken } = require("../middleware/requireAuth");
const { authenticateTokenOwner } = require("../middleware/requireAuthOwner");

// GET ALL
router.get("/", getAllUsers);

// DOWNLOAD
router.get("/data/download", downloadUsersData);

// GET ONE BY ID
router.get("/:userId", getUserById);

// FORGET PASSWORD
router.post("/forget-password", forgotPassword);

// VALIDATE RESET PASSWORD TOKEN
router.post("/reset-password/", resetPassword);

// SIGN UP
router.post("/signup", authenticateTokenOwner, createUser);

// SIGN IN
router.post("/signin", signInUser);

// // VALIDATE TOKEN
router.post("/check/:token", validateToken);

// UPDATE
router.patch("/:userId", authenticateToken, updateUser);

// DELETE
router.delete("/:userId", authenticateTokenOwner, deleteUser);

module.exports = router;
