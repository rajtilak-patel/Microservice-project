const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { HealthImplementation, service: healthService } = require("grpc-health-check");
const logger = require("../logger");
const User = require("../models/User");

const {
  grpcRequestCounter,
  grpcRequestDuration
} = require("../metrics"); // path correct rakho

// Load user proto
const packageDef = protoLoader.loadSync("proto/user.proto");
const userProto = grpc.loadPackageDefinition(packageDef).user;

const server = new grpc.Server();

// -----------------
// User gRPC Methods
// -----------------


server.addService(userProto.UserService.service, {
  GetUserById: async (call, callback) => {
    const startTime = Date.now();

    const labels = {
      service: "user-service",
      method: "GetUserById"
    };

    logger.info(`gRPC GetUserById called for ${call.request.userId}`);

    try {
      const user = await User.findById(call.request.userId);

      if (!user) {
        labels.status = "NOT_FOUND";

        grpcRequestCounter.inc(labels);
        grpcRequestDuration.observe(
          { service: labels.service, method: labels.method },
          (Date.now() - startTime) / 1000
        );

        logger.warn(`User not found: ${call.request.userId}`);

        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found"
        });
      }

      labels.status = "OK";

      grpcRequestCounter.inc(labels);
      grpcRequestDuration.observe(
        { service: labels.service, method: labels.method },
        (Date.now() - startTime) / 1000
      );

      callback(null, {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      });

    } catch (err) {
      labels.status = "ERROR";

      grpcRequestCounter.inc(labels);
      grpcRequestDuration.observe(
        { service: labels.service, method: labels.method },
        (Date.now() - startTime) / 1000
      );

      logger.error(err, "Error in GetUserById");

      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  }
});
// -----------------
// Standard gRPC Health (v2.1.0 syntax)
// -----------------

const healthImpl = new HealthImplementation({
  "": "SERVING",
  "user.UserService": "SERVING" // Add your actual service name
});

// Register health service using the exported service definition
server.addService(healthService, healthImpl);

// -----------------
// Start server
// -----------------
server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () => {
  console.log("User gRPC server running on port 50051");
  server.start();
});
