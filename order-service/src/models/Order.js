// order-service/src/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    productPrice: { type: Number, required: true },
    status: { type: String, default: "CREATED" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
