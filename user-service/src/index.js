// user-service/src/index.js
const mongoose = require("mongoose");
require("./grpc/service");
// user-service/src/index.js
const express = require("express");

const userRoutes = require("./routes/user.route");

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

mongoose.connect("mongodb+srv://rp2380264_db_user:S70Vpdtb9VKsC23T@cluster0.1dndw70.mongodb.net/user-service?retryWrites=true&w=majority")
  .then(() => console.log("User DB connected"));

app.listen(3001, () => {
  console.log("User Service REST running on port 3001");
});
