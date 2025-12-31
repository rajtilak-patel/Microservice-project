// order-service/src/grpc/clients/userClient.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const def = protoLoader.loadSync("proto/user.proto");
const userProto = grpc.loadPackageDefinition(def).user;

module.exports = new userProto.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
