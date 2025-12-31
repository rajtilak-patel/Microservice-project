const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const Order = require("../models/Order");

const userClient = require("./clients/userClient");
const productClient = require("./clients/productClient");

const def = protoLoader.loadSync("proto/order.proto");
const orderProto = grpc.loadPackageDefinition(def).order;

const server = new grpc.Server();

server.addService(orderProto.OrderService.service, {
  // 🔹 Existing CreateOrder
  CreateOrder: (call, callback) => {
    userClient.GetUserById({ userId: call.request.userId }, (err, user) => {
      if (err) {
        return callback({
          code: grpc.status.UNAVAILABLE,
          message: "User service unavailable"
        });
      }

      productClient.GetProductById(
        { productId: call.request.productId },
        async (err, product) => {
          if (err) {
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

            callback(null, {
              orderId: order._id.toString(),
              status: order.status
            });
          } catch (error) {
            callback({
              code: grpc.status.INTERNAL,
              message: error.message
            });
          }
        }
      );
    });
  },

  // 🟢 NEW: gRPC Health Check
  Health: (call, callback) => {
    const dbState =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    callback(null, {
      status: "UP",
      db: dbState
    });
  }
});

server.bindAsync(
  "0.0.0.0:50053",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Order gRPC server running on port 50053");
    server.start();
  }
);
