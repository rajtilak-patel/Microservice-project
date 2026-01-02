const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { HealthImplementation, service: healthService } = require("grpc-health-check");
const Order = require("../models/Order");
const logger = require("../logger"); // ✅ LOGGER

const userClient = require("./clients/userClient");
const productClient = require("./clients/productClient");

const def = protoLoader.loadSync("proto/order.proto");
const orderProto = grpc.loadPackageDefinition(def).order;

const server = new grpc.Server();

/* -----------------
   Order gRPC Service
------------------ */
server.addService(orderProto.OrderService.service, {
  CreateOrder: (call, callback) => {

    const startTime = Date.now();

    // ✅ REQUEST LOG
    logger.info({
      service: "order-service",
      grpc: "CreateOrder",
      userId: call.request.userId,
      productId: call.request.productId
    });

    // 🔁 CALL USER SERVICE
    userClient.GetUserById({ userId: call.request.userId }, (err, user) => {
      if (err) {
        logger.error({
          service: "order-service",
          dependency: "user-service",
          grpc: "GetUserById",
          error: err.message
        });

        return callback({
          code: grpc.status.UNAVAILABLE,
          message: "User service unavailable"
        });
      }

      // 🔁 CALL PRODUCT SERVICE
      productClient.GetProductById(
        { productId: call.request.productId },
        async (err, product) => {
          if (err) {
            logger.error({
              service: "order-service",
              dependency: "product-service",
              grpc: "GetProductById",
              error: err.message
            });

            return callback({
              code: grpc.status.UNAVAILABLE,
              message: "Product service unavailable"
            });
          }

          try {
            const order = await Order.create({
              userId: user.id,
              productId: product.id,
              productPrice: product.price,
              status: "CREATED"
            });

            // ✅ SUCCESS LOG
            logger.info({
              service: "order-service",
              grpc: "CreateOrder",
              orderId: order._id.toString(),
              status: order.status,
              durationMs: Date.now() - startTime
            });

            callback(null, {
              orderId: order._id.toString(),
              status: order.status
            });

          } catch (error) {

            // ❌ DB ERROR LOG
            logger.error({
              service: "order-service",
              grpc: "CreateOrder",
              error: error.message,
              stack: error.stack
            });

            callback({
              code: grpc.status.INTERNAL,
              message: error.message
            });
          }
        }
      );
    });
  }
});

// -----------------
// Standard gRPC Health (v2.1.0)
// -----------------
const healthImpl = new HealthImplementation({
  "": "SERVING",
  "order.OrderService": "SERVING"
});

server.addService(healthService, healthImpl);

/* -----------------
   Start Server
------------------ */
server.bindAsync(
  "0.0.0.0:50053",
  grpc.ServerCredentials.createInsecure(),
  (error) => {
    if (error) {
      logger.error({
        service: "order-service",
        message: "Failed to bind gRPC server",
        error: error.message
      });
      return;
    }

    logger.info("🚀 Order gRPC server running on port 50053");
    server.start();
  }
);
