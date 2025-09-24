// @ts-nocheck
const { GlobalVariablesAPI } = require("./GlobalVariablesAPI");

class DumpOperations {
  /**
   * Get value from a specific dump by attribute path
   * @param {string} dumpName - Name of the dump
   * @param {string} attributePath - Dot notation path to the attribute
   * @returns {any} The value found or null
   */
  static getValueFromDump(dumpName, attributePath) {
    const dumpData = GlobalVariablesAPI.getDump(dumpName);

    if (!dumpData) {
      console.log(`⚠️ Dump '${dumpName}' not found`);
      return null;
    }

    // Try to get from response body first, then from full dump
    let value = this.getNestedValue(dumpData.response.body, attributePath);
    if (value === undefined) {
      value = this.getNestedValue(dumpData, attributePath);
    }

    if (value !== undefined) {
      console.log(
        `✅ Retrieved value from dump '${dumpName}': ${attributePath} = ${value}`
      );
      return value;
    } else {
      console.log(
        `⚠️ Attribute path '${attributePath}' not found in dump '${dumpName}'`
      );
      return null;
    }
  }

  /**
   * Get value from the latest dump by attribute path
   * @param {string} attributePath - Dot notation path to the attribute
   * @returns {any} The value found or null
   */
  static getValueFromLatestDump(attributePath) {
    const dumpNames = GlobalVariablesAPI.getAllDumpNames();
    if (dumpNames.length === 0) {
      console.log(`⚠️ No dumps available to retrieve data from`);
      return null;
    }

    const latestDumpName = dumpNames[dumpNames.length - 1];
    return this.getValueFromDump(latestDumpName, attributePath);
  }

  /**
   * Get value from dump by API name and attribute path
   * @param {string} apiName - Name of the API (e.g., 'createFlowPost')
   * @param {string} attributePath - Dot notation path to the attribute
   * @returns {any} The value found or null
   */
  static getValueFromApiDump(apiName, attributePath) {
    const dumpNames = GlobalVariablesAPI.getAllDumpNames();

    // Find the most recent dump for this API
    const apiDumps = dumpNames.filter((name) => name.startsWith(apiName));
    if (apiDumps.length === 0) {
      console.log(`⚠️ No dumps found for API '${apiName}'`);
      return null;
    }

    // Get the latest dump for this API
    const latestApiDump = apiDumps[apiDumps.length - 1];
    return this.getValueFromDump(latestApiDump, attributePath);
  }

  /**
   * Set field value from dump data for use in subsequent requests
   * @param {string} fieldPath - Field path to set (e.g., 'flowId', 'agent.configuration.model')
   * @param {string} dumpName - Name of the dump
   * @param {string} attributePath - Attribute path in the dump
   */
  static setFieldFromDump(fieldPath, dumpName, attributePath) {
    const value = this.getValueFromDump(dumpName, attributePath);
    if (value !== null) {
      GlobalVariablesAPI.setUtilityData(`${fieldPath}_value`, value);
      console.log(
        `✅ Set field '${fieldPath}' = ${value} from dump '${dumpName}'`
      );
    }
  }

  /**
   * Set field value from latest dump data
   * @param {string} fieldPath - Field path to set
   * @param {string} attributePath - Attribute path in the dump
   */
  static setFieldFromLatestDump(fieldPath, attributePath) {
    const value = this.getValueFromLatestDump(attributePath);
    if (value !== null) {
      GlobalVariablesAPI.setUtilityData(`${fieldPath}_value`, value);
      console.log(`✅ Set field '${fieldPath}' = ${value} from latest dump`);
    }
  }

  /**
   * Set field value from specific API dump
   * @param {string} fieldPath - Field path to set
   * @param {string} apiName - Name of the API
   * @param {string} attributePath - Attribute path in the dump
   */
  static setFieldFromApiDump(fieldPath, apiName, attributePath) {
    const value = this.getValueFromApiDump(apiName, attributePath);
    if (value !== null) {
      GlobalVariablesAPI.setUtilityData(`${fieldPath}_value`, value);
      console.log(
        `✅ Set field '${fieldPath}' = ${value} from API dump '${apiName}'`
      );
    }
  }

  /**
   * Apply all stored field values to a payload object
   * @param {object} payload - The payload object to modify
   * @returns {object} Modified payload with applied field values
   */
  static applyStoredFieldsToPayload(payload) {
    const utilityData = GlobalVariablesAPI.utilityDump;
    let appliedCount = 0;

    for (const [key, value] of utilityData) {
      if (key.endsWith("_value")) {
        const fieldPath = key.replace("_value", "");
        this.setNestedValue(payload, fieldPath, value);
        console.log(
          `🔗 Request chaining: Set ${fieldPath} = ${value} from previous API call`
        );
        appliedCount++;
      }
    }

    if (appliedCount > 0) {
      console.log(
        `🔗 Applied ${appliedCount} field(s) from previous API calls`
      );
    }

    return payload;
  }

  /**
   * Get all available dumps with their details
   * @returns {Array} Array of dump information objects
   */
  static getAllDumpDetails() {
    const dumpNames = GlobalVariablesAPI.getAllDumpNames();
    const dumpDetails = [];

    dumpNames.forEach((dumpName, index) => {
      const dumpData = GlobalVariablesAPI.getDump(dumpName);
      if (dumpData) {
        dumpDetails.push({
          index: index + 1,
          name: dumpName,
          apiName: dumpData.apiName,
          timestamp: dumpData.timestamp,
          requestMethod: dumpData.request.method,
          requestUrl: dumpData.request.url,
          responseStatus: dumpData.response.statusCode,
          responseSuccess: dumpData.response.success,
        });
      }
    });

    return dumpDetails;
  }

  /**
   * Helper function to get nested value from object
   * @param {object} obj - The object to search
   * @param {string} path - Dot notation path
   * @returns {any} The value found or undefined
   */
  static getNestedValue(obj, path) {
    return path
      .split(".")
      .reduce((current, key) => current && current[key], obj);
  }

  /**
   * Helper function to set nested value in object
   * @param {object} obj - The object to modify
   * @param {string} path - Dot notation path
   * @param {any} value - The value to set
   */
  static setNestedValue(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Clear all stored field values
   */
  static clearStoredFields() {
    const utilityData = GlobalVariablesAPI.utilityDump;
    const fieldKeys = Array.from(utilityData.keys()).filter((key) =>
      key.endsWith("_value")
    );

    fieldKeys.forEach((key) => {
      utilityData.delete(key);
    });

    console.log(`🧹 Cleared ${fieldKeys.length} stored field(s)`);
  }
}

module.exports = { DumpOperations };
