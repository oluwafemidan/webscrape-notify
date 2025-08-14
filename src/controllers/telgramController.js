const {
  addSubscriberByIdFn,
  removeSubscriberByIdFn,
  pingAllSubscribers,
} = require("../services/telegramService");
const { ApiError } = require("../core/exception/errorHandler");
const { getSubscribersList } = require("../features/telegram");

/**
 * Get all current telegram subscribers
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getSubscribers = async (req, res) => {
  const subscribers = getSubscribersList();

  // Hiding sensitive information
  const safeSubscribers = subscribers.map((sub) => ({
    chatId: sub.chatId,
    firstName: sub.firstName,
    subscribedAt: sub.subscribedAt,
  }));

  res.status(200).json({
    success: true,
    count: safeSubscribers.length,
    data: safeSubscribers,
  });
};

/**
 * Ping all telegram subscribers
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const pingSubscribers = async (req, res) => {
  const message = req.body?.message;
  pingAllSubscribers(message);
  res.status(200).json({
    success: true,
    message: "Pinged all subscribers successfully",
  });
};

/**
 * Add a telegram subscriber manually
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const addSubscriber = async (req, res) => {
  const { chatId, firstName } = req.body;

  if (!chatId) {
    throw new ApiError(400, "Chat ID is required");
  }

  const subscriber = addSubscriberByIdFn(chatId, firstName || "Unknown");

  res.status(201).json({
    success: true,
    data: {
      chatId: subscriber.chatId,
      firstName: subscriber.firstName,
      subscribedAt: subscriber.subscribedAt,
    },
  });
};

/**
 * Remove a telegram subscriber
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const removeSubscriber = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(400, "Chat ID is required");
  }

  const result = removeSubscriberByIdFn(chatId);

  if (!result) {
    throw new ApiError(404, `Subscriber with chat ID ${chatId} not found`);
  }

  res.status(200).json({
    success: true,
    message: `Subscriber with chat ID ${chatId} removed successfully`,
  });
};

module.exports = {
  pingSubscribers,
  getSubscribers,
  addSubscriber,
  removeSubscriber,
};
