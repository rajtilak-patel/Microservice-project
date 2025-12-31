// user-service/src/index.js
const mongoose = require("mongoose");
require("./grpc/service");
// product-service/src/index.js
const express = require("express");
const productRoutes = require("./routes/product.route");

const app = express();
app.use(express.json());

app.use("/api/products", productRoutes);

mongoose.connect("mongodb+srv://rp2380264_db_user:S70Vpdtb9VKsC23T@cluster0.1dndw70.mongodb.net/product-service?retryWrites=true&w=majority")
  .then(() => console.log("Product DB connected"));

app.listen(3002, () => {
  console.log("Product Service REST running on port 3002");
});
