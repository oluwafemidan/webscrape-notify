class BaseExtractor {
  extract(html) {
    throw new Error("extract() must be implemented by subclass");
  }
}
module.exports = BaseExtractor;
