const express = require("express");
const { asyncHandler } = require("../core/exception/errorHandler");
const {
  getSubscribers,
  addSubscriber,
  removeSubscriber,
  pingSubscribers,
} = require("../controllers/telgramController");

const router = express.Router();

// Get all subscribers (admin only)
router.get("/subscribers", asyncHandler(getSubscribers));

// Ping all subscribers (admin only)
router.post("/subscribers/ping", asyncHandler(pingSubscribers));

// Add a subscriber manually (admin only)
router.post("/subscribers", asyncHandler(addSubscriber));

// Remove a subscriber manually (admin only)
router.delete("/subscribers/:chatId", asyncHandler(removeSubscriber));

module.exports = router;
