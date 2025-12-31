// user-service/src/grpc/server.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const User = require("../models/User");

const packageDef = protoLoader.loadSync("proto/user.proto");
const userProto = grpc.loadPackageDefinition(packageDef).user;

const server = new grpc.Server();

server.addService(userProto.UserService.service, {
  GetUserById: async (call, callback) => {
    const user = await User.findById(call.request.userId);
    if (!user) return callback(new Error("User not found"));

    callback(null, {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    });
  }
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => server.start()
);

console.log("gRPC server running on port 50051");