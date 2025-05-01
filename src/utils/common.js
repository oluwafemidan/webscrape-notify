const crypto = require("crypto");

/**
 * Create a unique identifier for a row
 * @param {object} row - Row data
 * @returns {string} Unique identifier for the row
 */
const createRowId = (row) => {
  if (!row || !row.title) {
    throw new Error("Row data is invalid or missing title property");
  }

  const input = `${row.title}|${row.link || ""}`; // Combine title and link
  return crypto
    .createHash("sha256")
    .update(input)
    .digest("hex")
    .substring(0, 20);
};
module.exports = {
  createRowId,
};
