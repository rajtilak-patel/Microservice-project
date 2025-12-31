// order-service/src/controllers/order.controller.js
const Order = require("../models/Order");
const userClient = require("../grpc/clients/userClient");
const productClient = require("../grpc/clients/productClient");

const createOrder = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "userId and productId are required"
      });
    }

    // 1️⃣ Fetch user via gRPC
    userClient.GetUserById({ userId }, (userErr, user) => {
      if (userErr) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // 2️⃣ Fetch product via gRPC
      productClient.GetProductById({ productId }, async (prodErr, product) => {
        if (prodErr) {
          return res.status(404).json({
            success: false,
            message: "Product not found"
          });
        }

        // 3️⃣ Create order
        const order = await Order.create({
          userId: user.id,
          productId: product.id,
          productPrice: product.price,
          status: "CREATED"
        });

        return res.status(201).json({
          success: true,
          message: "Order created successfully",
          data: order
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// helper: gRPC promise wrapper
const getUserById = (userId) =>
  new Promise((resolve, reject) => {
    userClient.GetUserById({ userId }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

const getProductById = (productId) =>
  new Promise((resolve, reject) => {
    productClient.GetProductById({ productId }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

const getOrdersWithDetails = async (req, res) => {
  try {
    const { userId } = req.query;

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // filter
    const filter = {};
    if (userId) filter.userId = userId;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    // 🔥 enrich orders with gRPC calls
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [user, product] = await Promise.all([
          getUserById(order.userId),
          getProductById(order.productId)
        ]);

        return {
          orderId: order._id,
          status: order.status,
          createdAt: order.createdAt,

          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },

          product: {
            id: product.id,
            name: product.name,
            price: product.price
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: enrichedOrders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Get order from DB
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // 2️⃣ Get user & product via gRPC (parallel)
    const [user, product] = await Promise.all([
      getUserById(order.userId),
      getProductById(order.productId)
    ]);

    // 3️⃣ Final response
    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        productPrice: order.productPrice,
        createdAt: order.createdAt,

        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },

        product: {
          id: product.id,
          name: product.name,
          price: product.price
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = { createOrder , getOrdersWithDetails , getOrderById };