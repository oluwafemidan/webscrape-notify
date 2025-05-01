const logger = require("../core/logger/logger");
const {
  addSubscriberById,
  removeSubscriberById,
  notifyAllSubscribers,
} = require("../features/telegram");

// In-memory storage for subscribers
let subscribers = [];

/**
 * Add a subscriber by chat ID
 * @param {number|string} chatId - Telegram chat ID
 * @param {string} firstName - User's first name
 * @returns {object|null} The added subscriber or null if already exists
 */
const addSubscriberByIdFn = (chatId, firstName) => {
  // Create new subscriber
  const newSubscriber = addSubscriberById(chatId, firstName);
  return newSubscriber;
};

/**
 * Remove a subscriber by chat ID
 * @param {number|string} chatId - Telegram chat ID
 * @returns {boolean} True if removed, false if not found
 */
const removeSubscriberByIdFn = (chatId) => {
  return removeSubscriberById(chatId);
};

/**
 * Get all subscribers
 * @returns {Array} List of all subscribers
 */
const getSubscribersList = () => {
  return [...subscribers];
};

const pingAllSubscribers = () => {
  notifyAllSubscribers("Ping! This is a test message.");
  logger.info("Pinged subscribers");
};

module.exports = {
  addSubscriberByIdFn,
  removeSubscriberByIdFn,
  getSubscribersList,
  pingAllSubscribers,
};
