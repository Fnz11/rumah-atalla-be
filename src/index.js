const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// const { initializeApp } = require("firebase/app");
// const { getAnalytics } = require("firebase/analytics");
// const { getMessaging, getToken } = require("firebase/messaging");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DB_URI;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"], // Tambahkan PATCH di sini
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/promos", require("./routes/promoRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/foods", require("./routes/foodRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
});
