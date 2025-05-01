const express = require("express");
const monitoringRoutes = require("./monitoringRoutes");
const telegramRoutes = require("./telegramRoutes");
const { ApiError } = require("../utils/errorHandler");

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register route modules
router.use("/monitoring", monitoringRoutes);
router.use("/telegram", telegramRoutes);

// Handle 404 routes
router.use("*", (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

module.exports = router;
