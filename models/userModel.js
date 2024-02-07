const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "owner"],
    default: "admin",
  },
  approved: {
    type: Boolean,
    default: false,
  },
  lamaOnline: {
    type: Number,
    default: false,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    url: { type: String },
    public_id: { type: String },
  },
  transactions: {
    type: {
      successed: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      canceled: {
        type: Number,
        default: 0,
      },
    },
    default: {
      successed: 0,
      pending: 0,
      canceled: 0,
    },
  },
  number: {
    type: String,
  },
});

// userSchema.pre("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     const hash = await bcrypt.hash(user.password, 10);
//     user.password = hash;
//   }
//   next();
// });

// Method to compare password during login
// userSchema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
