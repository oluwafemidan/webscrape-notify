const moment = require('moment-timezone');
const logger = require('../core/logger/logger');
const { startMonitoringService, stopMonitoringService, getMonitoringState } = require('./monitoringService');
const { scheduleJobMinutes } = require('../core/schedule/schedule');

class TimeAwareMonitoringService {
  constructor() {
    this.timeCheckJob = null;
    this.isInitialized = false;
    this.lastActiveState = null;
  }

  /**
   * Initialize the time-aware monitoring service
   */
  initialize() {
    if (this.isInitialized) {
      logger.warn('TimeAwareMonitoringService already initialized');
      return;
    }

    logger.info('🕐 Initializing Time-Aware Monitoring Service (11 AM - 11 PM IST)');
    
    // Check current time and start/stop monitoring accordingly
    this.checkAndUpdateMonitoringState();
    
    // Schedule a job to check time every minute and update monitoring state
    this.timeCheckJob = scheduleJobMinutes(1, () => {
      this.checkAndUpdateMonitoringState();
    });

    this.isInitialized = true;
    logger.info('✅ Time-Aware Monitoring Service initialized');
  }

  /**
   * Check current IST time and start/stop monitoring service accordingly
   */
  checkAndUpdateMonitoringState() {
    const currentTime = moment().tz('Asia/Kolkata');
    const currentHour = currentTime.hour();
    const shouldBeActive = currentHour >= 11 && currentHour < 23;
    
    const monitoringState = getMonitoringState();
    const isCurrentlyRunning = monitoringState.isRunning;

    // Only make changes if the state needs to change
    if (shouldBeActive && !isCurrentlyRunning) {
      // Should be active but isn't running - start it
      logger.info(`🟢 Activating monitoring service at ${currentTime.format('HH:mm:ss')} IST`);
      startMonitoringService();
      this.lastActiveState = true;
    } else if (!shouldBeActive && isCurrentlyRunning) {
      // Should be inactive but is running - stop it
      logger.info(`🔴 Deactivating monitoring service at ${currentTime.format('HH:mm:ss')} IST`);
      stopMonitoringService();
      this.lastActiveState = false;
    } else if (shouldBeActive !== this.lastActiveState) {
      // Log status when state changes (but no action needed)
      if (shouldBeActive) {
        logger.info(`⏰ Monitoring service active period (11 AM - 11 PM IST). Current time: ${currentTime.format('HH:mm:ss')} IST`);
      } else {
        logger.info(`😴 Monitoring service inactive period (11 PM - 11 AM IST). Current time: ${currentTime.format('HH:mm:ss')} IST`);
      }
      this.lastActiveState = shouldBeActive;
    }
  }

  /**
   * Get the current status of time-aware monitoring
   */
  getStatus() {
    const currentTime = moment().tz(process.env.TIME_ZONE);
    const currentHour = currentTime.hour();
    const shouldBeActive = currentHour >= 11 && currentHour < 23;
    const monitoringState = getMonitoringState();
    
    return {
      currentTime: currentTime.format('YYYY-MM-DD HH:mm:ss'),
      timezone: 'IST',
      currentHour,
      shouldBeActive,
      isMonitoringRunning: monitoringState.isRunning,
      activeHours: '11:00 AM - 11:00 PM IST',
      nextStateChange: this.getNextStateChangeTime(currentTime),
      monitoringStats: monitoringState.checks
    };
  }

  /**
   * Calculate when the monitoring state will change next
   */
  getNextStateChangeTime(currentTime) {
    const currentHour = currentTime.hour();
    const nextChange = currentTime.clone();
    
    if (currentHour < 11) {
      // Before 11 AM - next change is at 11 AM today (start)
      nextChange.hour(11).minute(0).second(0);
      return {
        time: nextChange.format('YYYY-MM-DD HH:mm:ss'),
        action: 'START'
      };
    } else if (currentHour >= 23) {
      // After 11 PM - next change is at 11 AM tomorrow (start)
      nextChange.add(1, 'day').hour(11).minute(0).second(0);
      return {
        time: nextChange.format('YYYY-MM-DD HH:mm:ss'),
        action: 'START'
      };
    } else {
      // Between 11 AM and 11 PM - next change is at 11 PM today (stop)
      nextChange.hour(23).minute(0).second(0);
      return {
        time: nextChange.format('YYYY-MM-DD HH:mm:ss'),
        action: 'STOP'
      };
    }
  }

  /**
   * Stop the time-aware monitoring service
   */
  shutdown() {
    if (this.timeCheckJob) {
      this.timeCheckJob.stop();
      this.timeCheckJob = null;
    }
    
    // Also stop the monitoring service if it's running
    stopMonitoringService();
    
    this.isInitialized = false;
    logger.info('🛑 Time-Aware Monitoring Service shut down');
  }
}

// Create singleton instance
const timeAwareMonitoringService = new TimeAwareMonitoringService();

module.exports = {
  timeAwareMonitoringService,
  TimeAwareMonitoringService
};