const express = require("express");
const monitoringRoutes = require("./monitoringRoutes");
const telegramRoutes = require("./telegramRoutes");
const { ApiError } = require("../core/exception/errorHandler");
const { fetchWebpage } = require("../services");

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/test-external-api", async (req, res) => {
  const targetUrl = "https://jsonplaceholder.typicode.com/users";
  const data = await fetchWebpage(targetUrl);
  return res.status(200).json({ data });
});
// Register route modules
router.use("/monitoring", monitoringRoutes);
router.use("/telegram", telegramRoutes);

// Handle 404 routes
router.use("*", (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

module.exports = router;
