// order-service/src/index.js
const express = require("express");
const mongoose = require("mongoose");

// 🔹 gRPC server start
require("./grpc/service");

const orderRoutes = require("./routes/order.route");

const app = express();
app.use(express.json());

// 🟢 Order APIs
app.use("/api/orders", orderRoutes);

// 🟢 HEALTH CHECK API
app.get("/health", (req, res) => {
  const dbState =
    mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

  res.status(200).json({
    status: "UP",
    service: "order-service",
    db: dbState,
    timestamp: new Date()
  });
});

// 🔹 MongoDB connection
mongoose
  .connect(
    "mongodb+srv://rp2380264_db_user:S70Vpdtb9VKsC23T@cluster0.1dndw70.mongodb.net/order-service?retryWrites=true&w=majority"
  )
  .then(() => console.log("Order DB connected"))
  .catch(err => console.error("DB error:", err.message));

// 🔹 REST server
app.listen(3003, () => {
  console.log("Order Service REST running on port 3003");
});
