const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const health = require("grpc-health-check");
const User = require("../models/User");

const packageDef = protoLoader.loadSync("proto/user.proto");
const userProto = grpc.loadPackageDefinition(packageDef).user;

const server = new grpc.Server();

/* -----------------
   User gRPC Service
------------------ */
server.addService(userProto.UserService.service, {
  GetUserById: async (call, callback) => {
    try {
      const user = await User.findById(call.request.userId);
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found"
        });
      }

      callback(null, {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  }
});

/* -----------------
   ✅ STANDARD gRPC HEALTH
------------------ */
const healthImpl = new health.Implementation({
  "": health.servingStatus.SERVING
});

server.addService(health.service, healthImpl);

/* -----------------
   Start Server
------------------ */
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("User gRPC server running on port 50051");
    server.start();
  }
);
