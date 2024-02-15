const admin = require("firebase-admin");
const serviceAccount = require("../credentials/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = ({ title, body }) => {
  var registrationToken = [
    "fZgboVvvtjKstCkdEdJPnx:APA91bEduCXSe641l8vB7yUm1fs6VLowWQ26c_eyHnNGdhY7-zkERHdLZm_iW91lbxcazVKIOOA0_Sp33aN7alcrOmynLXuwML3BWINSNmJ0yh3xaU716ZLVXx9YbeOLz1qrKK5j6d49",
  ];
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
  console.log("registration token : ", registrationToken[0], payload);
  admin
    .messaging()
    .sendToDevice(registrationToken[0], payload, options)
    .then(function (response) {
      console.log("successfully sent message : ", response);
    })
    .catch(function (err) {
      console.log("didn't work", err);
    });
};

module.exports = { sendNotification };
