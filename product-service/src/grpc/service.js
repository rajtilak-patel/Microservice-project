const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const packageDef = protoLoader.loadSync("proto/product.proto");
const productProto = grpc.loadPackageDefinition(packageDef).product;

const server = new grpc.Server();

server.addService(productProto.ProductService.service, {
  // 🔹 Existing method
  GetProductById: async (call, callback) => {
    try {
      const product = await Product.findById(call.request.productId);
      if (!product) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Product not found"
        });
      }

      callback(null, {
        id: product._id.toString(),
        name: product.name,
        price: product.price
      });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
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
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Product gRPC server running on port 50052");
    server.start();
  }
);
