// order-service/src/grpc/server.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const Order = require("../models/Order");

const userClient = require("./clients/userClient");
const productClient = require("./clients/productClient");

const def = protoLoader.loadSync("proto/order.proto");
const orderProto = grpc.loadPackageDefinition(def).order;

const server = new grpc.Server();

server.addService(orderProto.OrderService.service, {
  CreateOrder: (call, callback) => {
    userClient.GetUserById({ userId: call.request.userId }, (err, user) => {
      if (err) return callback(err);

      productClient.GetProductById(
        { productId: call.request.productId },
        async (err, product) => {
          if (err) return callback(err);

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
        }
      );
    });
  }
});

server.bindAsync(
  "0.0.0.0:50053",
  grpc.ServerCredentials.createInsecure(),
  () => server.start()
);
