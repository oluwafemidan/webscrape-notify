const axios = require("axios");
const logger = require("../core/logger/logger");
const { ApiError } = require("../core/exception/errorHandler");

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
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 30000, // 30 seconds timeout
    });

    logger.info(`Response header: ${response.headers["content-type"]}`);
    logger.info(response.data.slice(0, 500));

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

module.exports = {
  fetchWebpage,
};
