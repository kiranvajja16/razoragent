const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const cartRoutes = require("./routes/cartRoutes");
const productRoutes = require("./routes/productRoutes");
const agentRoutes = require("./routes/agentRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "RazorAgent API is running ",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`RazorAgent server running on port ${PORT}`);
  });
};

startServer();