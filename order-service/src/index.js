// user-service/src/index.js
const mongoose = require("mongoose");
const express = require("express");
require("./grpc/service");

// order-service/src/index.js



const orderRoutes = require("./routes/order.route");

const app = express();
app.use(express.json());

app.use("/api/orders", orderRoutes);

mongoose.connect("mongodb+srv://rp2380264_db_user:S70Vpdtb9VKsC23T@cluster0.1dndw70.mongodb.net/order-service?retryWrites=true&w=majority")
  .then(() => console.log("Order DB connected"));

app.listen(3003, () => {
  console.log("Order Service REST running on port 3003");
});
