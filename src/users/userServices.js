const {
  createUser,
  getAllUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
} = require("./userRepositorys");

const findAllUsers = async () => {
  return await getAllUser({});
};

const findUserById = async (userId) => {
  return await getUserById(userId);
};

const findUserByEmail = async (userEmail) => {
  return await getUserByEmail(userEmail);
};

const insertUser = async (userData) => {
  console.log("SERVO", userData);
  return await createUser(userData);
};

const changeUser = async (userId, updatedData) => {
  return await updateUser(userId, updatedData);
};

const deleteUserById = async (userId) => {
  return await deleteUser(userId);
};

module.exports = {
  findAllUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  changeUser,
  deleteUserById,
};
