// order-service/src/routes/order.routes.js
const express = require("express");
const router = express.Router();
const { createOrder , getOrdersWithDetails , getOrderById } = require("../controllers/order.controller");

router.post("/", createOrder);

router.get("/", getOrdersWithDetails);

router.get("/:id", getOrderById);

module.exports = router;
