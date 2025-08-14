const express = require("express");
const { asyncHandler } = require("../core/exception/errorHandler");
const {
  getMonitoringStatus,
  triggerManualCheck,
  getTimeAwareStatus,
} = require("../controllers");

const router = express.Router();

// Get current monitoring status
router.get("/status", asyncHandler(getMonitoringStatus));

// Trigger a manual check
router.post("/check", asyncHandler(triggerManualCheck));

// Get time-aware monitoring status
router.get("/time-status", asyncHandler(getTimeAwareStatus));

module.exports = router;
