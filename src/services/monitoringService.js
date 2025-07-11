const logger = require("../core/logger/logger");
const {
  notifyAllSubscribers,
  notifyOnlyToTester,
} = require("../features/telegram");
const { ExtractedData } = require("../models");
const { fetchWebpage } = require("./scrapingService");
const { extractWebPageData } = require("../core/scrapper/extractorManager");
const ResultPageExtractor = require("../features/resultpage/ResultPageExtractor");

const {
  scheduleJobMinutes,
  stopScheduledJob,
} = require("../core/schedule/schedule");

// In-memory storage for monitoring state
let monitoringState = {
  isRunning: false,
  lastCheckTime: null,
  lastCheckResult: null,
  scheduledJob: null,
  // previousTableData: [],
  checks: {
    total: 0,
    successful: 0,
    failed: 0,
    withChanges: 0,
  },
};

/**
 * Start the monitoring service with scheduled checks
 */
const startMonitoringService = () => {
  try {
    // Schedule a job
    const MINUTES = process.env.CHECK_INTERVAL_MINUTES || 15;
    const job = scheduleJobMinutes(MINUTES, async () => {
      await performCheck();
    });

    if (job) {
      logger.info(`🕓 Job scheduled to check every ${MINUTES} Minutes.`);
    }

    // Update state
    monitoringState.scheduledJob = job;
    monitoringState.isRunning = true;

    // Perform initial check
    performCheck();

    return true;
  } catch (error) {
    logger.error(`Failed to start monitoring service: ${error.message}`);
    return false;
  }
};

/**
 * Stop the monitoring service
 */
const stopMonitoringService = () => {
  if (monitoringState.scheduledJob) {
    stopScheduledJob(monitoringState.scheduledJob);
    monitoringState.scheduledJob = null;
    monitoringState.isRunning = false;
    logger.info("Monitoring service stopped");
    return true;
  }

  return false;
};

/**
 * Perform a check of the target website
 * @param {boolean} isManual - Whether the check was triggered manually
 * @returns {Promise<object>} Check result
 */
const performCheck = async (isManual = false) => {
  try {
    logger.info(
      `🚀 Performing ${isManual ? "manual" : "scheduled"} check of target website for [ ${monitoringState.checks.total} ] times`
    );

    const prevExtractedData = await ExtractedData.find();

    // Increment check counter
    monitoringState.checks.total++;

    // Fetch and parse RESULT webpage
    // const resultData = await extractWebPageData(
    //   "RESULT",
    //   process.env.RESULT_PAGE_URL
    // );
    // Fetch and parse HOME webpage
    const homeData = await extractWebPageData(
      "HOME",
      process.env.HOME_PAGE_URL
    );
    // Combine both page data
    const resultData = [];

    const pageTableData = [...resultData, ...homeData];

    // Find new rows (not in previous data)
    const newRows = findNewRows(pageTableData, prevExtractedData);

    logger.info(`New Rows found : ${newRows.length}`);
    if (newRows.length) {
      newRows.forEach((r) => logger.info(r));
    }
    // Update check result
    const result = {
      timestamp: new Date(),
      hasChanges: newRows.length > 0,
      totalRows: pageTableData.length,
      newRows: newRows,
    };

    // Update monitoring state
    monitoringState.lastCheckTime = result.timestamp;
    monitoringState.lastCheckResult = result;
    monitoringState.checks.successful++;

    // save records to DB only when broadcast mode enabled
    if(process.env.BRODCAST_TELEGRAM_MESSAGE.toLocaleLowerCase() === "true"){
      await insertExtractedData(pageTableData);
    }

    if (result.hasChanges) {
      monitoringState.checks.withChanges++;
      await notifySubscribersAboutChanges(newRows);
    }

    logger.info(
      `Check completed. Found ${newRows.length} new rows out of ${pageTableData.length} total rows.`
    );

    return result;
  } catch (error) {
    // Update monitoring state
    monitoringState.checks.failed++;
    monitoringState.lastCheckTime = new Date();
    monitoringState.lastCheckResult = {
      timestamp: new Date(),
      error: error.message,
      success: false,
    };

    logger.error(`Check failed: ${error.message}`);
    throw error;
  }
};

/**
 * Insert extracted data into the database
 * @param {Array} items - Array of items to insert
 */
const insertExtractedData = async (items) => {
  for (const item of items) {
    await ExtractedData.updateOne(
      { id: item.id },
      { $setOnInsert: item },
      { upsert: true }
    );
  }
};

/**
 * Find new rows in the current data compared to previous data
 * @param {Array} currentData - Current table data
 * @param {Array} previousData - Previous table data
 * @returns {Array} New rows
 */
const findNewRows = (currentData, previousData) => {
  if (!previousData || previousData.length === 0) {
    // First check, return all rows as new
    return currentData;
  }

  // Get IDs of previous rows
  const previousIds = new Set(previousData.map((row) => row.id));

  // Filter current rows that weren't in previous data
  return currentData.filter((row) => !previousIds.has(row.id));
};

/**
 * Notify subscribers about changes
 * @param {Array} newRows - New rows to notify about
 */
const notifySubscribersAboutChanges = async (newRows) => {
  if (newRows.length === 0) return;

  try {
    // Format the message
    const message = formatNotificationMessage(newRows);
    // Send notification to all subscribers
    if (process.env.BRODCAST_TELEGRAM_MESSAGE.toLocaleLowerCase() === "true") {
      await notifyAllSubscribers(message);
    } else {
      await notifyOnlyToTester(message);
    }

    logger.info(`Notifications sent about ${newRows.length} new results`);
  } catch (error) {
    logger.error(`Failed to send notifications: ${error.message}`);
  }
};

/**
 * Format notification message
 * @param {Array} newRows - New rows to include in notification
 * @returns {string} Formatted message
 */
const formatNotificationMessage = (newRows) => {
  // Create message header
  let message = "🔔 *New TPSC Notifications * 🔔\n\n";

  // Add timestamp
  // message += `Updated at: ${new Date().toLocaleString()}\n\n`;

  // Add new results
  message += `🔥 Found ${newRows.length} new update${
    newRows.length === 1 ? "" : "s"
  }🔥\n\n`;

  // Limit max rows to send in notification
  const rowsToShow = newRows.slice(
    0,
    process.env.MAX_ROWS_TO_SEND_NOTIFICATION
  );

  rowsToShow.forEach((row, index) => {
    message += `${index + 1}. `;

    // Format row data
    const rowData = `${row.title} - (${row.link})`;

    message += `${rowData}\n`;
  });

  message += `\nFollow & share 🤖 @notifymejob_bot\n`

  return message;
};

/**
 * Get current monitoring state
 * @returns {object} Current monitoring state
 */
const getMonitoringState = () => {
  return {
    isRunning: monitoringState.isRunning,
    lastCheckTime: monitoringState.lastCheckTime,
    checkInterval: process.env.CHECK_INTERVAL_MINUTES || 15,
    checks: monitoringState.checks,
    lastResult: monitoringState.lastCheckResult
      ? {
          timestamp: monitoringState.lastCheckResult.timestamp,
          hasChanges: monitoringState.lastCheckResult.hasChanges,
          totalRows: monitoringState.lastCheckResult.totalRows,
          newRowsCount: monitoringState.lastCheckResult.newRows?.length || 0,
        }
      : null,
  };
};

module.exports = {
  startMonitoringService,
  stopMonitoringService,
  performCheck,
  getMonitoringState,
};
