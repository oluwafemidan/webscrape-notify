const TelegramBot = require("node-telegram-bot-api");
const logger = require("../../core/logger/logger");
const { Subscriber } = require("../../models");

// Create a bot instance
let bot = null;

/**
 * Initialize the Telegram bot service
 * @returns {TelegramBot} The configured bot instance
 */
const initializeTelegramBot = () => {
  if (bot) {
    return bot;
  }
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
  // if (bot !== null) return;

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || "User";
    const message = `👋 Hello ${
      firstName ? firstName : ""
    }!\n\nWelcome to *NotifyMe Job Bot* — a smart bot to help you stay updated on the latest job results and notifications.\n\n📍 *Currently, this bot only supports job alerts for Tripura.*\n\n✅ Type /subscribe to start receiving notifications. \n\n🤖  Type /help to see all available commands.`;
    bot.sendMessage(chatId, escapeMarkdown(message), {
      parse_mode: "MarkdownV2",
    });
  });

  // Handle /subscribe command
  bot.onText(/\/subscribe/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || "User";

    const subscriber = await addSubscriberById(chatId, firstName);
    const message = `✅ You're now *subscribed* to receive notifications!\n\n📢 I’ll notify you whenever new jobs are published. Stay tuned! 😉\n\n🤖 Type /help to see all available commands.`;

    if (subscriber) {
      bot.sendMessage(chatId, escapeMarkdown(message), {
        parse_mode: "MarkdownV2",
      });
    } else {
      const message = `🔔 You're already *subscribed*!\n\nWant to stop notifications?\nJust hit /unsubscribe anytime.`;

      bot.sendMessage(chatId, escapeMarkdown(message), {
        parse_mode: "MarkdownV2",
      });
    }
  });

  // Handle /unsubscribe command
  bot.onText(/\/unsubscribe/, async (msg) => {
    const chatId = msg.chat.id;

    const removed = await removeSubscriberById(chatId);
    const message = `🔕 You’ve been unsubscribed. No more job alerts… for now 😌\n\n😉 Changed your mind?\nJust /subscribe again — and we’ll start notifying you again.`;

    if (removed) {
      bot.sendMessage(chatId, escapeMarkdown(message), {
        parse_mode: "MarkdownV2",
      });
    } else {
      bot.sendMessage(
        chatId,
        `You're not currently subscribed. Use /subscribe to start receiving notifications.`
      );
    }
  });

  // Handle /help command
  bot.onText(/\/help/, async (msg) => {
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
  bot.onText(/\/status/, async (msg) => {
    const currSubscribers = await getSubscribersList();
    const chatId = msg.chat.id;
    logger.info("chatId : " + chatId);
    currSubscribers.forEach((c) => {
      logger.info(c);
    });
    const isSubscribed = currSubscribers.some(
      (sub) => (sub) => String(sub.chatId) === String(chatId)
    );

    if (isSubscribed) {
      const subscriber = currSubscribers.find(
        (sub) => String(sub.chatId) === String(chatId)
      );
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
const addSubscriberById = async (chatId, firstName) => {
  chatId = Number(chatId);
  const exists = await Subscriber.exists({ chatId });
  // Check if already subscribed
  if (exists) {
    logger.info(`User ${firstName} (${chatId}) is already subscribed`);
    return null;
  }

  const newSubscriber = await Subscriber.findOneAndUpdate(
    { chatId },
    { $setOnInsert: { chatId, firstName } },
    { upsert: true, new: true }
  );
  console.log("newSubscriber", newSubscriber);

  logger.info(`New subscriber added: ${firstName} (${chatId})`);

  return newSubscriber;
};

/**
 * Remove a subscriber by chat ID
 * @param {number|string} chatId - Telegram chat ID
 * @returns {boolean} True if removed, false if not found
 */
const removeSubscriberById = async (chatId) => {
  chatId = Number(chatId);

  const result = await Subscriber.deleteOne({ chatId });
  const success = result.deletedCount > 0;

  if (success) {
    logger.info(`Subscriber ${chatId} removed successfully`);
  } else {
    logger.info(`Subscriber ${chatId} not found`);
  }

  return success;
};

/**
 * Get all subscribers
 * @returns {Array} List of all subscribers
 */
const getSubscribersList = async () => {
  const subs = await Subscriber.find();
  return subs;
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
  if (process.env.BRODCAST_TELEGRAM_MESSAGE.toLocaleLowerCase() === "false") {
    logger.info("Broadcasting message disabled.");
    return [];
  }
  const currentSubscribers = await getSubscribersList();
  if (!currentSubscribers) {
    logger.error("No subscribers found");
    return [];
  }

  logger.info(
    `Sending notification to ${currentSubscribers.length} subscribers`
  );

  const defaultOptions = { parse_mode: "MarkdownV2" };
  const messageOptions = { ...defaultOptions, ...options };

  const sendPromises = currentSubscribers.map(async (subscriber) => {
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

const notifyOnlyToTester = async (message, options = {}) => {
  if (!bot) {
    logger.error("Bot not initialized");
    return [];
  }
  const testerChatId = process.env.TESTER_CHAT_ID;
  if (!testerChatId) {
    logger.error("Tester Id is undefined");
  }
  logger.info(`Sending notification to only tester`);

  const defaultOptions = { parse_mode: "MarkdownV2" };
  const messageOptions = { ...defaultOptions, ...options };

  try {
    await bot.sendMessage(
      testerChatId,
      escapeMarkdown(message),
      messageOptions
    );

    return {
      chatId: testerChatId,
      success: true,
    };
  } catch (error) {
    logger.error(`Failed to send notification to tester`, error);

    return {
      chatId: testerChatId,
      success: false,
      error: error.message,
    };
  }
};

const escapeMarkdown = (text) =>
  text
    .replace(/_/g, "\\_")
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
  notifyOnlyToTester,
};
