// order-service/src/grpc/clients/productClient.js

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const def = protoLoader.loadSync(
  path.join(__dirname, "../../../proto/product.proto")
);

const productProto = grpc.loadPackageDefinition(def).product;

const client = new productProto.ProductService(
  "product-service:50052", // 👈 MUST match product gRPC server port
  grpc.credentials.createInsecure()
);

module.exports = client;
