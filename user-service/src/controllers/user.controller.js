// user-service/src/controllers/user.controller.js
const User = require("../models/User");

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const user = await User.create({ name, email });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { createUser };