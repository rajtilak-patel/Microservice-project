// product-service/src/controllers/product.controller.js
const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required"
      });
    }

    const product = await Product.create({ name, price });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = { createProduct };