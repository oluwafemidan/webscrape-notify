const {
  performCheck,
  getMonitoringState,
} = require("../services");
const { ApiError } = require("../core/exception/errorHandler");
const logger = require("../core/logger/logger");

/**
 * Get current monitoring status
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getMonitoringStatus = async (req, res) => {
  const status = getMonitoringState();
  res.status(200).json({
    success: true,
    data: status,
  });
};

/**
 * Trigger a manual check of the target website
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const triggerManualCheck = async (req, res) => {
  try {
    const checkResult = await performCheck(true);
    res.status(200).json({
      success: true,
      data: {
        message: "Manual check triggered successfully",
        hasChanges: checkResult.hasChanges,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    throw new ApiError(500, `Failed to perform manual check: ${error.message}`);
  }
};

module.exports = {
  getMonitoringStatus,
  triggerManualCheck,
};
