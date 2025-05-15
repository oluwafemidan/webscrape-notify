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
      // Traverse all list items within the marquee
      $("marquee ul li").each((index, li) => {
        if (rowCount >= maxRowToParse) {
          return notificationDataRows;
        }
        rowCount++;

        const anchor = $(li).find("a");

        // Remove <img> to get clean text only
        anchor.find("img").remove();

        const title = anchor.text().trim();
        let link = anchor.attr("href");

        // Skip if no title
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

        // // simulate new rows
        // notificationDataRows.push({
        //   title: "New HOME PAGE NOTIFICATION!!!",
        //   link: "https://example.com/job/12345",
        //   id: createRowId({
        //     title: Math.random().toString(36).substring(2, 10),
        //   }),
        // });

        notificationDataRows.push(row);
      });

      logger.info(
        `Extracted ${notificationDataRows.length} notificationDataRows from homepage marquee`
      );
      return notificationDataRows;
    } catch (error) {
      console.error(error);
      logger.error(`Error extracting marquee data: ${error.message}`);
      throw error;
    }
  }
}

module.exports = HomePageExtractor;
