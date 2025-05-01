const mongoose = require("mongoose");

const extractedDataSchema = new mongoose.Schema({
  pageType: { type: String, required: true },
  entries: [
    {
      title: String,
      link: String,
      id: String,
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ExtractedData", extractedDataSchema);
