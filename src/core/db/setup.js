const mongoose = require("mongoose");
const logger = require("../../core/logger/logger");
const { scheduleDeleteOldData } = require("./operation");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("✅ MongoDB connected");
    scheduleDeleteOldData();
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
