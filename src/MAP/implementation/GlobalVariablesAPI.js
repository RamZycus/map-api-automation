// @ts-nocheck
class GlobalVariablesAPI {
  static jsonDumpRepositoryPath = "./jsonDumpRepository";
  static jsonDumpMap = new Map();
  static dumpName = "";
  static utilityDump = new Map();

  /**
   * Set dump name for current API response
   * @param {string} apiName - Name of the API
   */
  static setDumpName(apiName) {
    this.dumpName = `${apiName}_Dump_${new Date().getTime()}`;
    return this.dumpName;
  }

  /**
   * Store response data in memory map
   * @param {string} dumpName - Name of the dump
   * @param {object} responseData - Response data to store
   */
  static storeDump(dumpName, responseData) {
    this.jsonDumpMap.set(dumpName, responseData);
    console.log(`💾 Stored dump in memory: ${dumpName}`);
  }

  /**
   * Get stored dump from memory
   * @param {string} dumpName - Name of the dump
   * @returns {object} Stored response data
   */
  static getDump(dumpName) {
    return this.jsonDumpMap.get(dumpName);
  }

  /**
   * Get all available dump names
   * @returns {Array} Array of dump names
   */
  static getAllDumpNames() {
    return Array.from(this.jsonDumpMap.keys());
  }

  /**
   * Clear all dumps from memory
   */
  static clearDumps() {
    this.jsonDumpMap.clear();
    this.utilityDump.clear();
    console.log("🧹 Cleared all dumps from memory");
  }

  /**
   * Store utility data
   * @param {string} key - Key for the data
   * @param {any} value - Value to store
   */
  static setUtilityData(key, value) {
    this.utilityDump.set(key, value);
  }

  /**
   * Get utility data
   * @param {string} key - Key for the data
   * @returns {any} Stored value
   */
  static getUtilityData(key) {
    return this.utilityDump.get(key);
  }
}

module.exports = { GlobalVariablesAPI };
