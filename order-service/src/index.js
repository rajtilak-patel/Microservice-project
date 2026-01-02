// order-service/src/index.js
const express = require("express");
const mongoose = require("mongoose");
const logger = require("./logger");
const { client, httpRequestCounter } = require("./matrics");
// 🔹 gRPC server start
require("./grpc/service");

const orderRoutes = require("./routes/order.route");

const app = express();
app.use(express.json());

// 🟢 Order APIs
app.use("/api/orders", orderRoutes);

// 🔹 Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

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


// 🔹 Metrics endpoint (IMPORTANT)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
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
  logger.info("Order Service REST running on port 3003");
});
