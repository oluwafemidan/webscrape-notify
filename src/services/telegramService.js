const TelegramBot = require("node-telegram-bot-api");
const logger = require("../core/logger/logger");

// In-memory storage for subscribers
let subscribers = [];

// Create a bot instance
let bot;

/**
 * Initialize the Telegram bot service
 * @returns {TelegramBot} The configured bot instance
 */
const initializeTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    logger.error("TELEGRAM_BOT_TOKEN is not defined in environment variables");
    throw new Error("Telegram bot token is required");
  }

  try {
    // Initialize the bot
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    logger.info("Telegram bot initialized successfully");

    // Set up event handlers
    setupBotCommands();

    return bot;
  } catch (error) {
    logger.error("Failed to initialize Telegram bot:", error);
    throw error;
  }
};

/**
 * Set up bot commands and handlers
 */
const setupBotCommands = () => {
  if (!bot) return;

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || "User";

    bot.sendMessage(
      chatId,
      `Hello ${firstName}! 👋\n\nI'll notify you about new results. Use /subscribe to start receiving notifications.`
    );
  });

  // Handle /subscribe command
  bot.onText(/\/subscribe/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || "User";

    const subscriber = addSubscriberById(chatId, firstName);

    if (subscriber) {
      bot.sendMessage(
        chatId,
        `✅ You're now subscribed to receive notifications!\n\nI'll send you a message whenever new results are published.`
      );
    } else {
      bot.sendMessage(
        chatId,
        `You're already subscribed! Use /unsubscribe if you want to stop receiving notifications.`
      );
    }
  });

  // Handle /unsubscribe command
  bot.onText(/\/unsubscribe/, (msg) => {
    const chatId = msg.chat.id;

    const removed = removeSubscriberById(chatId);

    if (removed) {
      bot.sendMessage(
        chatId,
        `You've been unsubscribed. You won't receive any more notifications.\n\nUse /subscribe to start receiving notifications again.`
      );
    } else {
      bot.sendMessage(
        chatId,
        `You're not currently subscribed. Use /subscribe to start receiving notifications.`
      );
    }
  });

  // Handle /help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(
      chatId,
      `*Notification Bot*\n\n` +
        `Available commands:\n` +
        `/start - Start the bot\n` +
        `/subscribe - Subscribe to notifications\n` +
        `/unsubscribe - Unsubscribe from notifications\n` +
        `/status - Check your subscription status\n` +
        `/help - Show this help message`,
      { parse_mode: "Markdown" }
    );
  });

  // Handle /status command
  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const isSubscribed = subscribers.some((sub) => sub.chatId === chatId);

    if (isSubscribed) {
      const subscriber = subscribers.find((sub) => sub.chatId === chatId);
      const subscribedDate = new Date(subscriber.subscribedAt).toLocaleString();

      bot.sendMessage(
        chatId,
        `✅ *Subscription Status*\n\nYou are currently subscribed to notifications.\nSubscribed since: ${subscribedDate}`,
        { parse_mode: "Markdown" }
      );
    } else {
      bot.sendMessage(
        chatId,
        `❌ *Subscription Status*\n\nYou are not currently subscribed to notifications. Use /subscribe to start receiving updates.`,
        { parse_mode: "Markdown" }
      );
    }
  });

  // Handle unknown commands
  bot.on("message", (msg) => {
    const chatId = msg.chat.id;

    // Skip processing of known commands
    if (
      msg.text &&
      (msg.text.startsWith("/start") ||
        msg.text.startsWith("/subscribe") ||
        msg.text.startsWith("/unsubscribe") ||
        msg.text.startsWith("/help") ||
        msg.text.startsWith("/status"))
    ) {
      return;
    }

    // Respond to other messages
    bot.sendMessage(
      chatId,
      `I don't understand that command. Use /help to see available commands.`
    );
  });
};

/**
 * Add a subscriber by chat ID
 * @param {number|string} chatId - Telegram chat ID
 * @param {string} firstName - User's first name
 * @returns {object|null} The added subscriber or null if already exists
 */
const addSubscriberById = (chatId, firstName) => {
  chatId = Number(chatId);

  // Check if already subscribed
  if (subscribers.some((sub) => sub.chatId === chatId)) {
    logger.info(`User ${firstName} (${chatId}) is already subscribed`);
    return null;
  }

  // Create new subscriber
  const newSubscriber = {
    chatId,
    firstName,
    subscribedAt: new Date(),
    lastNotified: null,
  };

  subscribers.push(newSubscriber);
  logger.info(`New subscriber added: ${firstName} (${chatId})`);

  return newSubscriber;
};

/**
 * Remove a subscriber by chat ID
 * @param {number|string} chatId - Telegram chat ID
 * @returns {boolean} True if removed, false if not found
 */
const removeSubscriberById = (chatId) => {
  chatId = Number(chatId);
  const initialLength = subscribers.length;

  subscribers = subscribers.filter((sub) => sub.chatId !== chatId);

  const wasRemoved = subscribers.length < initialLength;

  if (wasRemoved) {
    logger.info(`Subscriber ${chatId} removed successfully`);
  } else {
    logger.info(`Subscriber ${chatId} not found`);
  }

  return wasRemoved;
};

/**
 * Get all subscribers
 * @returns {Array} List of all subscribers
 */
const getSubscribersList = () => {
  return [...subscribers];
};

/**
 * Send notification to all subscribers
 * @param {string} message - Message to send
 * @param {object} options - Additional options for the message
 * @returns {Promise<Array>} Result of send operations
 */
const notifyAllSubscribers = async (message, options = {}) => {
  if (!bot) {
    logger.error("Bot not initialized");
    return [];
  }

  if (subscribers.length === 0) {
    logger.info("No subscribers to notify");
    return [];
  }

  logger.info(`Sending notification to ${subscribers.length} subscribers`);

  const defaultOptions = { parse_mode: "MarkdownV2" };
  const messageOptions = { ...defaultOptions, ...options };

  const sendPromises = subscribers.map(async (subscriber) => {
    try {
      await bot.sendMessage(
        subscriber.chatId,
        escapeMarkdown(message),
        messageOptions
      );

      // Update last notified timestamp
      subscriber.lastNotified = new Date();

      return {
        chatId: subscriber.chatId,
        success: true,
      };
    } catch (error) {
      logger.error(
        `Failed to send notification to ${subscriber.chatId}:`,
        error
      );

      return {
        chatId: subscriber.chatId,
        success: false,
        error: error.message,
      };
    }
  });

  return Promise.all(sendPromises);
};

const escapeMarkdown = (text) =>
  text
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
    .replace(/>/g, "\\>")
    .replace(/#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/-/g, "\\-")
    .replace(/=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/!/g, "\\!");

module.exports = {
  initializeTelegramBot,
  addSubscriberById,
  removeSubscriberById,
  getSubscribersList,
  notifyAllSubscribers,
};
