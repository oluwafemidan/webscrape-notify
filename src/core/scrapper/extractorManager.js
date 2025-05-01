const ResultPageExtractor = require("../../features/resultpage/ResultPageExtractor");
const HomePageExtractor = require("../../features/homepage/HomePageExtractor");

const { fetchWebpage } = require("../../services/scrapingService");

const extractors = {
  RESULT: new ResultPageExtractor(),
  HOME: new HomePageExtractor(),
};

async function extractWebPageData(type, url) {
  if (!extractors[type]) {
    throw new Error(`No extractor found for type: ${type}`);
  }

  const html = await fetchWebpage(url);
  return extractors[type].extract(html);
}

module.exports = { extractWebPageData };
