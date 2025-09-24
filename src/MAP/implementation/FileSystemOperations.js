// @ts-nocheck
const fs = require("fs");
const path = require("path");

class FileSystemOperations {
  /**
   * Dumps the json object to file under the given directory
   *
   * @param {object} jsonObject - The JSON object to dump
   * @param {string} filePath - Full file path including filename
   */
  static async dumpJsonToFile(jsonObject, filePath) {
    try {
      // Extract directory path from file path
      const directoryPath = path.dirname(filePath);

      // Create directory if it doesn't exist
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      // Write JSON to file
      fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 2));
      console.log(`📁 JSON dumped successfully to file: ${filePath}`);

      return true;
    } catch (error) {
      console.error(
        `❌ Failed to dump JSON to file ${filePath}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Reads JSON file and returns as object
   *
   * @param {string} filePath - Path to JSON file
   * @returns {object} Parsed JSON object
   */
  static async readJsonFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Failed to read JSON file ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Checks if file exists
   *
   * @param {string} filePath - Path to file
   * @returns {boolean} True if file exists
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Creates directory if it doesn't exist
   *
   * @param {string} directoryPath - Path to directory
   */
  static createDirectory(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`📁 Created directory: ${directoryPath}`);
    }
  }
}

module.exports = { FileSystemOperations };
