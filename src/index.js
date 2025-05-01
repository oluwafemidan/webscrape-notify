require("dotenv").config();
const express = require("express");

const { connectDB } = require("./core/db/setup");
const logger = require("./core/logger/logger");
const { setupMiddleware } = require("./middleware");
const routes = require("./routes");
const { handleUncaughtErrors } = require("./core/exception/errorHandler");
const { startMonitoringService } = require("./services/monitoringService");

// Create Express application
const app = express();

connectDB();

// Apply middleware
setupMiddleware(app);

// Register routes
app.use("/api", routes);

// Error handling middleware
app.use(handleUncaughtErrors);

// Define port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  logger.info(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );

  // Start the monitoring service after server is running
  startMonitoringService();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  // Don't crash the server, log the error and continue
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  // For uncaught exceptions, it's safer to exit and let the process manager restart
  process.exit(1);
});
