require("dotenv").config();
const express = require("express");

const { connectDB } = require("./core/db/setup");
const logger = require("./core/logger/logger");
const { setupMiddleware } = require("./middleware");
const routes = require("./routes");
const { handleUncaughtErrors } = require("./core/exception/errorHandler");
const {
  timeAwareMonitoringService,
} = require("./services/timeAwareMonitoringService");
const { initializeTelegramBot } = require("./features/telegram");
// Create Express application
const app = express();

connectDB();

// Apply middleware
setupMiddleware(app);

app.get("/test", (req, res) => {
  const value = {
    key1: "name",
    key2: "password",
  };
  logger.info("Test route testing...");
  res.send(value);
});

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
  // Initialize Telegram bot
  initializeTelegramBot();
  // Start the time-aware monitoring service (11 AM - 11 PM IST)
  timeAwareMonitoringService.initialize();
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

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.info("Received SIGINT. Shutting down gracefully...");
  timeAwareMonitoringService.shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Received SIGTERM. Shutting down gracefully...");
  timeAwareMonitoringService.shutdown();
  process.exit(0);
});

module.exports = app;
