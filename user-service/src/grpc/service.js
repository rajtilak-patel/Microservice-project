const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const User = require("../models/User");

const packageDef = protoLoader.loadSync("proto/user.proto");
const userProto = grpc.loadPackageDefinition(packageDef).user;

const server = new grpc.Server();

// -----------------
// gRPC Methods
// -----------------
server.addService(userProto.UserService.service, {
  GetUserById: async (call, callback) => {
    try {
      const user = await User.findById(call.request.userId);
      if (!user) return callback(new Error("User not found"));

      callback(null, {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      });
    } catch (err) {
      callback(err);
    }
  },

  // ✅ Health check method
  health: (call, callback) => {
    callback(null, { status: "SERVING" });
  }
});

// -----------------
// Start server
// -----------------
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("gRPC server running on port 50051");
    server.start();
  }
);
