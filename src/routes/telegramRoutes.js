const express = require("express");
const { asyncHandler } = require("../utils/errorHandler");
const {
  getSubscribers,
  addSubscriber,
  removeSubscriber,
} = require("../controllers/telgramController");

const router = express.Router();

// Get all subscribers (admin only)
router.get("/subscribers", asyncHandler(getSubscribers));

// Add a subscriber manually (admin only)
router.post("/subscribers", asyncHandler(addSubscriber));

// Remove a subscriber manually (admin only)
router.delete("/subscribers/:chatId", asyncHandler(removeSubscriber));

module.exports = router;
