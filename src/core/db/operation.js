const cron = require("node-cron");

const { ExtractedData } = require("../../models");
const logger = require("../../core/logger/logger");

const limit = process.env.EXTRACTED_DATA_LIMIT; // Max items you want to keep

const scheduleDeleteOldData = () => {
  const interval = process.env.DELETE_DATA_INTERVAL_HOURS || 12; // Default to 12 hour
  const cronExpression = `0 */${interval} * * *`; // Run every X hours
  // Create cron job
  const job = cron.schedule(cronExpression, async () => {
    try {
      await cleanupOldExtractedData();
      logger.info(`Old extracted data cleaned up at ${new Date()}`);
    } catch (error) {
      logger.info(`Error cleaning up old extracted data: ${error.message}`);
    }
  });
  logger.info(
    `Scheduled job to delete old extracted data every ${interval} hours`
  );
};

const cleanupOldExtractedData = async () => {
  const totalCount = await ExtractedData.countDocuments();
  const excess = totalCount - limit;

  if (excess > 0) {
    await ExtractedData.find({})
      .sort({ createdAt: 1 }) // Oldest first
      .limit(excess)
      .then((docs) => {
        const idsToDelete = docs.map((doc) => doc._id);
        return ExtractedData.deleteMany({ _id: { $in: idsToDelete } });
      });
    logger.info(`Cleaned up ${excess} old extracted data records`);
  }
};

module.exports = {
  scheduleDeleteOldData,
};
