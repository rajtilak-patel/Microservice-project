// product-service/src/index.js
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/product.route");

// 🔹 gRPC server start (important)
require("./grpc/service");

const app = express();
app.use(express.json());

// 🟢 Product APIs
app.use("/api/products", productRoutes);

// 🟢 HEALTH CHECK API (NEW)
app.get("/health", (req, res) => {
  const dbState =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

  res.status(200).json({
    status: "UP",
    service: "product-service",
    db: dbState,
    timestamp: new Date()
  });
});

// 🔹 MongoDB connection
mongoose
  .connect(
    "mongodb+srv://rp2380264_db_user:S70Vpdtb9VKsC23T@cluster0.1dndw70.mongodb.net/product-service?retryWrites=true&w=majority"
  )
  .then(() => console.log("Product DB connected"))
  .catch(err => console.error("DB error:", err.message));

// 🔹 REST server
app.listen(3002, () => {
  console.log("Product Service REST running on port 3002");
});
