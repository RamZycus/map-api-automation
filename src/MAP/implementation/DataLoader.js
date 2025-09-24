// @ts-nocheck
const fs = require("fs");
const path = require("path");

class DataLoader {
  static environmentData = null;
  static currentEnvironment = null;
  static currentTenant = null;

  static loadEnvironmentData(environment, tenant) {
    this.currentEnvironment = environment;
    this.currentTenant = tenant;

    const dataPath = path.join(
      __dirname,
      `../../DataRepository/${environment}_TestData.json`
    );

    try {
      const data = fs.readFileSync(dataPath, "utf8");
      this.environmentData = JSON.parse(data);
      console.log(`✅ Loaded environment data for ${environment}/${tenant}`);
      return this.environmentData;
    } catch (error) {
      throw new Error(
        `Failed to load environment data for ${environment}: ${error.message}`
      );
    }
  }

  static getBaseUrl() {
    if (!this.environmentData) {
      throw new Error(
        "Environment data not loaded. Call loadEnvironmentData() first."
      );
    }
    return this.environmentData.baseUrl;
  }

  static getApiEndpoint(apiName) {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error(
        "Environment data not loaded. Call loadEnvironmentData() first."
      );
    }

    const tenantData = this.environmentData.tenants[this.currentTenant];
    if (!tenantData || !tenantData.apiEndpoints) {
      throw new Error(
        `Tenant '${this.currentTenant}' not found or no API endpoints configured`
      );
    }

    return tenantData.apiEndpoints[apiName] || "";
  }

  static getDefaultHeaders() {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error(
        "Environment data not loaded. Call loadEnvironmentData() first."
      );
    }

    const tenantData = this.environmentData.tenants[this.currentTenant];
    return tenantData.defaultHeaders || {};
  }

  static getTestData(dataPath) {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error(
        "Environment data not loaded. Call loadEnvironmentData() first."
      );
    }

    const tenantData = this.environmentData.tenants[this.currentTenant];
    if (!tenantData.testData) {
      throw new Error(
        `No test data configured for tenant '${this.currentTenant}'`
      );
    }

    const pathParts = dataPath.split(".");
    let data = tenantData.testData;

    for (const part of pathParts) {
      if (data && data[part]) {
        data = data[part];
      } else {
        throw new Error(
          `Test data path '${dataPath}' not found for tenant '${this.currentTenant}'`
        );
      }
    }

    return data;
  }

  static getTenantId() {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error(
        "Environment data not loaded. Call loadEnvironmentData() first."
      );
    }

    const tenantData = this.environmentData.tenants[this.currentTenant];
    return tenantData.tenantId;
  }
}

module.exports = { DataLoader };
