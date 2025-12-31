// order-service/src/grpc/clients/userClient.js

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const packageDef = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/user.proto")
);

const userProto = grpc.loadPackageDefinition(packageDef).user;

const client = new userProto.UserService(
  "user-service:50051",   // 🔥 VERY IMPORTANT
  grpc.credentials.createInsecure()
);

module.exports = client;
