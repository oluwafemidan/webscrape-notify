const express = require("express");
const { asyncHandler } = require("../utils/errorHandler");
const {
  getMonitoringStatus,
  triggerManualCheck,
  pingSubscribers,
} = require("../controllers/monitoringController");

const router = express.Router();

// Get current monitoring status
router.get("/status", asyncHandler(getMonitoringStatus));

// Ping all subscribers (admin only)
router.post("/ping", asyncHandler(pingSubscribers));

// Trigger a manual check
router.post("/check", asyncHandler(triggerManualCheck));

module.exports = router;
