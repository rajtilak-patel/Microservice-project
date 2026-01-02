// user-service/src/index.js
const express = require("express");
const mongoose = require("mongoose");
const logger = require("./logger");
const metricsClient = require("./metrics");


require("./grpc/service"); // gRPC server start

const userRoutes = require("./routes/user.route");

const app = express();
app.use(express.json());
// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check route
app.get("/health", async (req, res) => {
  try {
    // DB check
    const dbState = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    res.status(200).json({ status: "UP", db: dbState });
  } catch (err) {
    res.status(500).json({ status: "DOWN", db: "Disconnected" });
  }
});

app.use("/api/users", userRoutes);

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsClient.register.contentType);
  res.end(await metricsClient.register.metrics());
});

// MongoDB connection
mongoose.connect("mongodb+srv://rp2380264_db_user:S70Vpdtb9VKsC23T@cluster0.1dndw70.mongodb.net/user-service?retryWrites=true&w=majority")
  .then(() => console.log("User DB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.listen(3001, () => {
  console.log("User Service REST running on port 3001");
  logger.info("User Service REST running on port 3001");
});


