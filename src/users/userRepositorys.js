const User = require("../../models/userModel");

const getAllUser = async () => {
  return await User.find({});
};

const getUserById = async (userId) => {
  return await User.findById(userId);
};

const getUserByEmail = async (userEmail) => {
  return await User.find({ email: userEmail });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

const updateUser = async (userId, updatedData) => {
  try {
    console.log("CHANGECHANGE", updatedData);
    return await User.findByIdAndUpdate(userId, updatedData, { new: true });
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

module.exports = {
  createUser,
  getAllUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
};
