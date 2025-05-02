const cron = require("node-cron");

const scheduledJobs = [];

const INDIAN_TIME_ZONE = "Asia/Kolkata"; // Set the timezone to India Standard Time (IST)

const options = {
  timezone: INDIAN_TIME_ZONE,
};

const scheduleJobSeconds = (seconds, jobToSchedule) => {
  const cronExpression = `*/${seconds} * * * * *`; // Run every X seconds
  const job = cron.schedule(cronExpression, jobToSchedule, options);

  scheduledJobs.push(job);
  return job;
};

const scheduleJobMinutes = (minutes, jobToSchedule) => {
  const cronExpression = `*/${minutes} * * * *`; // Run every X minutes
  const job = cron.schedule(cronExpression, jobToSchedule, options);
  scheduledJobs.push(job);
  return job;
};

const scheduleJobHours = (hours, jobToSchedule) => {
  const cronExpression = `0 */${hours} * * *`; // Run every X hours
  const job = cron.schedule(cronExpression, jobToSchedule, options);

  scheduledJobs.push(job);
  return job;
};

const stopScheduledJob = (job) => {
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
