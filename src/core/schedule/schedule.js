const cron = require("node-cron");
const logger = require("../logger/logger");

const scheduledJobs = [];

const options = {
  timezone: process.env.TIME_ZONE || "Asia/Kolkata",
};

const scheduleJobSeconds = (seconds, jobToSchedule) => {
  if (String(process.env.SCHEDULING_ENABLED).toLowerCase() !== "true") {
    logger.info("Scheduling disabled. Unable to schedule cron job.");
    return null;
  }
  const cronExpression = `*/${seconds} * * * * *`; // Run every X seconds
  const job = cron.schedule(cronExpression, jobToSchedule, options);

  scheduledJobs.push(job);
  return job;
};

const scheduleJobMinutes = (minutes, jobToSchedule) => {
  if (String(process.env.SCHEDULING_ENABLED).toLowerCase() !== "true") {
    logger.info("Scheduling disabled. Unable to schedule cron job.");
    return null;
  }
  const cronExpression = `*/${minutes} * * * *`; // Run every X minutes
  const job = cron.schedule(cronExpression, jobToSchedule, options);
  scheduledJobs.push(job);
  return job;
};

const scheduleJobHours = (hours, jobToSchedule) => {
  if (String(process.env.SCHEDULING_ENABLED).toLowerCase() !== "true") {
    logger.info("Scheduling disabled. Unable to schedule cron job.");
    return null;
  }
  const cronExpression = `0 */${hours} * * *`; // Run every X hours
  const job = cron.schedule(cronExpression, jobToSchedule, options);

  scheduledJobs.push(job);
  return job;
};

const stopScheduledJob = (job) => {
  if (!job) {
    logger.error("Job is not defined");
    return;
  }
  job.stop();
  const index = scheduledJobs.indexOf(job);
  if (index > -1) {
    scheduledJobs.splice(index, 1); // Remove the job from the array
  }
};

const stopAllScheduledJobs = () => {
  scheduledJobs.forEach((job) => {
    job.stop();
  });
  scheduledJobs.length = 0; // Clear the array
};

module.exports = {
  scheduleJobSeconds,
  scheduleJobMinutes,
  scheduleJobHours,
  stopScheduledJob,
  stopAllScheduledJobs,
};
