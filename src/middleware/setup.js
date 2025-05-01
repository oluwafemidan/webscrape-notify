const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("../core/logger/logger");

/**
 * Sets up all middleware for the Express application
 * @param {Express} app - Express application instance
 */
const setupMiddleware = (app) => {
  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(cors());

  // Request parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging middleware
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
};

module.exports = {
  setupMiddleware,
};
