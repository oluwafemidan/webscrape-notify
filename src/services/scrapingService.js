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

    logger.info(`Fetching webpage from url: ${targetUrl}`);

    const response = await axios.get(targetUrl);

    if (response.status !== 200) {
      throw new Error(`Received non-200 response: ${response.status}`);
    }

    logger.debug(
      `Webpage fetched successfully (${response.data.length} bytes)`
    );

    return response.data;
  } catch (error) {
    logger.error(error);
    logger.error(`Error fetching webpage: ${error.message}`);
    throw error;
  }
};

module.exports = {
  fetchWebpage,
};
