const mongoose = require("mongoose");

const extractedDataSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Unique ID for deduplication
  title: { type: String, required: true },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ExtractedData", extractedDataSchema);
