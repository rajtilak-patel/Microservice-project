// product-service/src/grpc/server.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const Product = require("../models/Product");

const packageDef = protoLoader.loadSync("proto/product.proto");
const productProto = grpc.loadPackageDefinition(packageDef).product;

const server = new grpc.Server();

server.addService(productProto.ProductService.service, {
  GetProductById: async (call, callback) => {
    const product = await Product.findById(call.request.productId);
    if (!product) return callback(new Error("Product not found"));

    callback(null, {
      id: product._id.toString(),
      name: product.name,
      price: product.price
    });
  }
});

server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => server.start()
);
