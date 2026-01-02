// product-service/src/index.js
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/product.route");
const logger = require("./logger");
const { client, httpRequestCounter } = require("./matrics");
// 🔹 gRPC server start (important)
require("./grpc/service");

const app = express();
app.use(express.json());

// 🟢 Product APIs
app.use("/api/products", productRoutes);


// 🔹 Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});


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

// 🔹 Metrics endpoint (IMPORTANT)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
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
  logger.info("Product Service REST running on port 3002");
});
