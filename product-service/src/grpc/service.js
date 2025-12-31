const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
// const health = require("grpc-health-check");
const Product = require("../models/Product");

const { HealthImplementation, service: healthService } = require("grpc-health-check");
const packageDef = protoLoader.loadSync("proto/product.proto");
const productProto = grpc.loadPackageDefinition(packageDef).product;

const server = new grpc.Server();

/* -----------------
   Product gRPC Service
------------------ */
server.addService(productProto.ProductService.service, {
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
  }
});

// -----------------
// Standard gRPC Health (v2.1.0 syntax)
// -----------------
const healthImpl = new HealthImplementation({
  "": "SERVING",
  "product.ProductService": "SERVING" // Add your actual service name
});

// Register health service using the exported service definition
server.addService(healthService, healthImpl);
/* -----------------
   Start Server
------------------ */
server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log("Product gRPC server running on port 50052");
    server.start();
  }
);
