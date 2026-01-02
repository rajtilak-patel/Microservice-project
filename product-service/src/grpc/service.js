const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { HealthImplementation, service: healthService } = require("grpc-health-check");
const Product = require("../models/Product");
const logger = require("../logger"); // ✅ ADD LOGGER

const packageDef = protoLoader.loadSync("proto/product.proto");
const productProto = grpc.loadPackageDefinition(packageDef).product;

const server = new grpc.Server();

/* -----------------
   Product gRPC Service
------------------ */
server.addService(productProto.ProductService.service, {
  GetProductById: async (call, callback) => {

    const startTime = Date.now();

    // ✅ REQUEST LOG
    logger.info({
      service: "product-service",
      grpc: "GetProductById",
      productId: call.request.productId
    });

    try {
      const product = await Product.findById(call.request.productId);

      if (!product) {
        // ⚠️ NOT FOUND LOG
        logger.warn({
          service: "product-service",
          grpc: "GetProductById",
          productId: call.request.productId,
          message: "Product not found"
        });

        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Product not found"
        });
      }

      // ✅ SUCCESS LOG
      logger.info({
        service: "product-service",
        grpc: "GetProductById",
        status: "SUCCESS",
        durationMs: Date.now() - startTime
      });

      callback(null, {
        id: product._id.toString(),
        name: product.name,
        price: product.price
      });

    } catch (err) {

      // ❌ ERROR LOG
      logger.error({
        service: "product-service",
        grpc: "GetProductById",
        error: err.message,
        stack: err.stack
      });

      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  }
});

// -----------------
// Standard gRPC Health (v2.1.0)
// -----------------
const healthImpl = new HealthImplementation({
  "": "SERVING",
  "product.ProductService": "SERVING"
});

server.addService(healthService, healthImpl);

/* -----------------
   Start Server
------------------ */
server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  () => {
    logger.info("🚀 Product gRPC server running on port 50052");
    server.start();
  }
);
