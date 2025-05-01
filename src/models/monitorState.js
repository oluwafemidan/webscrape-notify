const mongoose = require("mongoose");

const monitoringStatSchema = new mongoose.Schema({
  pageType: String,
  checksPerformed: Number,
  lastCheck: Date,
  lastChangeDetected: Date,
});

module.exports = mongoose.model("MonitoringStat", monitoringStatSchema);
