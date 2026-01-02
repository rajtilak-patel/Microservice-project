const client = require("prom-client");

// Collect default Node.js metrics (CPU, memory, event loop)
client.collectDefaultMetrics();

const grpcRequestCounter = new client.Counter({
  name: "grpc_requests_total",
  help: "Total number of gRPC requests",
  labelNames: ["service", "method", "status"]
});

const grpcRequestDuration = new client.Histogram({
  name: "grpc_request_duration_seconds",
  help: "gRPC request latency",
  labelNames: ["service", "method"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

module.exports = {
  client,
  register: client.register,
  grpcRequestCounter,
  grpcRequestDuration
};
