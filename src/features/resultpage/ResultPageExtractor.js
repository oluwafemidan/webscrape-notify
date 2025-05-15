const BaseExtractor = require("../../core/scrapper/BaseExtractor");
const cheerio = require("cheerio");
const logger = require("../../core/logger/logger");
const { createRowId } = require("../../utils/common");

const maxRowToParse = process.env.MAX_ROWS_TO_PARSE; // Limit to 3 rows for performance
class ResultPageExtractor extends BaseExtractor {
  constructor() {
    super();
  }
  /**
   * Extracts the result page data from the HTML content.
   * @param {string} html - The HTML content of the result page.
   * @returns {Object} - An object containing the extracted data.
   */
  extract(html) {
    try {
      const $ = cheerio.load(html);
      const notificationDataRows = [];

      // Find the result table - adjust selector based on actual page structure
      // This is an example; you may need to adjust based on the actual HTML structure

      let rowCount = 0;
      $("table tr").each((index, element) => {
        // Skip header row
        if (index === 0) return;
        if (rowCount >= maxRowToParse) {
          return notificationDataRows;
        }
        rowCount++;

        const row = {};

        // Extract cells from the row
        $(element)
          .find("td")
          .each((cellIndex, cell) => {
            switch (cellIndex) {
              case 1:
                row.title = $(cell).text().trim();
                break;
              case 2:
                row.link = $(cell).find("a").attr("href");
                break;
              default:
                break;
            }
          });

        // Add row if it has content
        if (Object.keys(row).length > 0) {
          // Add a unique identifier for comparison
          row.id = createRowId(row);
          notificationDataRows.push(row);
        }
        // logger.info("Row extracted:", row);
      });

      logger.info(`Extracted ${notificationDataRows.length} rows from table`);

      // // simulate new rows
      // notificationDataRows.push({
      //   title: "New Job TEST AVAILABLE!!!",
      //   link: "https://example.com/job/12345",
      //   id: createRowId({
      //     title: Math.random().toString(36).substring(2, 10),
      //   }),
      // });

      return notificationDataRows;
    } catch (error) {
      console.error(error);
      logger.error(`Error extracting table data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ResultPageExtractor;
