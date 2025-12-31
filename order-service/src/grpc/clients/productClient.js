// order-service/src/grpc/clients/productClient.js
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const def = protoLoader.loadSync("proto/product.proto");
const productProto = grpc.loadPackageDefinition(def).product;

module.exports = new productProto.ProductService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);
