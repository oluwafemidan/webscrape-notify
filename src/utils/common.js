/**
 * Create a unique identifier for a row
 * @param {object} row - Row data
 * @returns {string} Unique identifier for the row
 */
const createRowId = (row) => {
  if (!row || !row.title) {
    throw new Error("Row data is invalid or missing title property");
  }
  // Create a unique ID based on row title
  // This is a simple implementation; you may want to use a more robust method
  const values = row.title;
  return Buffer.from(values).toString("base64").substring(0, 20);
};

module.exports = {
  createRowId,
};
