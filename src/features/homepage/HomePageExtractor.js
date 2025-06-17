const BaseExtractor = require("../../core/scrapper/BaseExtractor");
const cheerio = require("cheerio");
const logger = require("../../core/logger/logger");
const { createRowId } = require("../../utils/common");

const maxRowToParse = process.env.MAX_ROWS_TO_PARSE; // Limit rows for performance

class HomePageExtractor extends BaseExtractor {
  constructor() {
    super();
  }

  /**
   * Extracts the home page data from the HTML content.
   * @param {string} html - The HTML content of the home page.
   * @returns {Object} - An object containing the extracted data.
   */
  extract(html) {
    try {
      const $ = cheerio.load(html);
      const notificationDataRows = [];
      let rowCount = 0;

      // Select the first .news-box element
      const newsBox = $(".news-box").first();

      // Traverse .views-field elements inside ul under .news-box
      newsBox.find("ul .views-field").each((index, el) => {
        if (rowCount >= maxRowToParse) return false; // break loop
        rowCount++;

        const anchor = $(el).find("a");

        if (!anchor || anchor.length === 0) return;

        const title = anchor.text().trim();
        let link = anchor.attr("href");

        if (!title) return;

        // Handle relative URLs
        if (link && !link.startsWith("http")) {
          link = `https://${process.env.BASE_URL}/${link}`;
        }

        const row = {
          title,
          link,
          id: createRowId({ title }),
        };

        notificationDataRows.push(row);
      });

      logger.info(
        `Extracted ${notificationDataRows.length} notificationDataRows from .news-box`
      );
      return notificationDataRows;
    } catch (error) {
      console.error(error);
      logger.error(`Error extracting data from .news-box: ${error.message}`);
      throw error;
    }
  }
}

module.exports = HomePageExtractor;
