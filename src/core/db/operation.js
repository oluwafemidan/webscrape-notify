const { scheduleJobHours } = require("../../core/schedule/schedule");

const { ExtractedData } = require("../../models");
const logger = require("../../core/logger/logger");

const limit = process.env.EXTRACTED_DATA_LIMIT; // Max items you want to keep

const scheduleDeleteOldData = () => {
  if (String(process.env.SCHEDULING_ENABLED_DELETE_OLD_DATA).toLowerCase() !== "true") {
    logger.info(
      "Scheduling disabled. Unable to schedule scheduleDeleteOldData job."
    );
    return;
  }
  // schedule a job
  const HOURS = process.env.DELETE_DATA_INTERVAL_HOURS || 12; // Default to 12 hour
  scheduleJobHours(HOURS, async () => {
    try {
      await cleanupOldExtractedData();
      logger.info(`Old extracted data cleaned up at ${new Date()}`);
    } catch (error) {
      logger.info(`Error cleaning up old extracted data: ${error.message}`);
    }
  });

  logger.info(
    `Scheduled job to delete old extracted data every ${HOURS} hours`
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
