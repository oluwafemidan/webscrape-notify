const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../utils/logger");
const { ApiError } = require("../utils/errorHandler");

const maxRowToParse = 3; // Limit to 3 rows for performance

/**
 * Fetch the target webpage
 * @returns {Promise<string>} HTML content of the page
 */
const fetchWebpage = async (targetUrl) => {
  try {
    if (!targetUrl || targetUrl.startsWith("http") === false) {
      throw new ApiError(
        400,
        "Invalid target URL. Please provide a valid URL starting with http or https."
      );
    }

    logger.info(`Fetching webpage: ${targetUrl}`);

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 10000, // 10 seconds timeout
    });

    if (response.status !== 200) {
      throw new Error(`Received non-200 response: ${response.status}`);
    }

    logger.debug(
      `Webpage fetched successfully (${response.data.length} bytes)`
    );

    return response.data;
  } catch (error) {
    logger.error(`Error fetching webpage: ${error.message}`);
    throw error;
  }
};

/**
 * Extract table data from the HTML content
 * @param {string} html - HTML content of the page
 * @returns {Array} Extracted table rows
 */
const extractResultPageTableData = (html) => {
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
};

/**
 * Extracts list of notifications from the marquee element on the homepage.
 * Each item includes a title, link, and a unique ID for tracking.
 *
 * @param {string} html - Raw HTML of the homepage
 * @returns {Array} Structured list of notifications
 */
const extractHomePageMarqueeData = (html) => {
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
        link = `https://baseurl.com/${link}`;
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
};

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
  fetchWebpage,
  extractResultPageTableData,
  extractHomePageMarqueeData,
};
