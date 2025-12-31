// user-service/src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/user.controller");

router.post("/", createUser);

module.exports = router;
