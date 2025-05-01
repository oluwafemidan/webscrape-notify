const express = require("express");
const { asyncHandler } = require("../core/exception/errorHandler");
const {
  getMonitoringStatus,
  triggerManualCheck,
} = require("../controllers");

const router = express.Router();

// Get current monitoring status
router.get("/status", asyncHandler(getMonitoringStatus));

// Trigger a manual check
router.post("/check", asyncHandler(triggerManualCheck));

module.exports = router;
