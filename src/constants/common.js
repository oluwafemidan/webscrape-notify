/**
 * Application constants
 */

// Application metadata
const APP = {
  NAME: "Website Monitor Notification Service",
  VERSION: "1.0.0",
};

// Default configuration values
const DEFAULTS = {
  PORT: 3000,
  CHECK_INTERVAL_MINUTES: 15,
  TARGET_URL: "",
  LOG_LEVEL: "info",
};

// Rate limiting
const RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_CHECKS_PER_HOUR: 30,
};

// HTTP Status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Response messages
const MESSAGES = {
  SERVER_STARTED: "Server started successfully",
  SERVER_ERROR: "Server error",
  CHECK_SUCCESS: "Check completed successfully",
  CHECK_FAILURE: "Check failed",
  SUBSCRIBER_ADDED: "Subscriber added successfully",
  SUBSCRIBER_REMOVED: "Subscriber removed successfully",
  NOTIFICATION_SENT: "Notification sent successfully",
};

module.exports = {
  APP,
  DEFAULTS,
  RATE_LIMITS,
  HTTP_STATUS,
  MESSAGES,
};
