const admin = require("firebase-admin");
const { findAllUsers } = require("../users/userServices");
const serviceAccount = require("../credentials/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "http://localhost:3000",
  projectId: "test-raffi",
});

let tokens = [];
const reloadUserToken = async () => {
  try {
    const users = await findAllUsers();
    if (users && users?.length > 0) {
      users?.map((user) => {
        if (user.role === "owner") {
          tokens.push(...user.FCMToken);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const sendNotification = ({ title, body }) => {
  if (tokens.length == 0) {
    return res.status(404).json({ message: "User not found" });
  }
  var payload = {
    notification: {
      title: title,
      body: body,
    },
    data: {
      title: title,
      body: body,
    },
  };
  var options = {
    priority: "high", //for android,web
    timeToLive: 60 * 60,
  };
  //main function which sends messages.
  admin
    .messaging()
    .sendToDevice(tokens, payload, options)
    .then(function (response) {
      console.log("successfully sent message : ", response);
    })
    .catch(function (err) {
      console.log("didn't work", err);
    });
};

module.exports = { sendNotification, reloadUserToken };
