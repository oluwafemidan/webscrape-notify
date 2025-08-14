const logger = require("../core/logger/logger");
const {
  addSubscriberById,
  removeSubscriberById,
  notifyAllSubscribers,
  notifyOnlyToTester,
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
const getSubscribersList = async () => {
  return [];
};

const pingAllSubscribers = (message) => {
  if (process.env.BRODCAST_TELEGRAM_MESSAGE.toLocaleLowerCase() === "true") {
    notifyAllSubscribers(message ? message : "Ping! This is a test message.");
    logger.info("Pinged subscribers");
  } else {
    notifyOnlyToTester(
      message ? message : "Ping! This is a test message for tester only."
    );
    logger.info("Pinged to only tester");
  }
};

module.exports = {
  addSubscriberByIdFn,
  removeSubscriberByIdFn,
  getSubscribersList,
  pingAllSubscribers,
};
