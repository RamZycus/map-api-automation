// @ts-nocheck
const fs = require('fs');
const path = require('path');

export class DataLoader {
  static environmentData = null;
  static currentEnvironment = null;
  static currentTenant = null;

  static loadEnvironmentData(environment, tenant) {
    this.currentEnvironment = environment;
    this.currentTenant = tenant;
    
    const dataPath = path.join(__dirname, `../DataRepository/${environment}_TestData.json`);
    
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      this.environmentData = JSON.parse(data);
      console.log(`✅ Loaded environment data for ${environment}/${tenant}`);
      return this.environmentData;
    } catch (error) {
      throw new Error(`Failed to load environment data for ${environment}: ${error.message}`);
    }
  }

  static getBaseUrl() {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error('Environment data not loaded. Call loadEnvironmentData() first.');
    }
    
    const tenantData = this.environmentData.tenants[this.currentTenant];
    if (!tenantData || !tenantData.Api_Global_Data) {
      throw new Error(`Tenant '${this.currentTenant}' not found or no global data configured`);
    }
    
    // Get IP_PORT from global data
    const ipPort = tenantData.Api_Global_Data.IP_PORT;
    if (!ipPort) {
      throw new Error(`IP_PORT not configured for tenant '${this.currentTenant}'`);
    }
    
    return `http://${ipPort}`;
  }

  static getDefaultHeaders() {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error('Environment data not loaded. Call loadEnvironmentData() first.');
    }
    
    const tenantData = this.environmentData.tenants[this.currentTenant];
    if (!tenantData || !tenantData.Api_Global_Data) {
      return {};
    }
    
    const globalData = tenantData.Api_Global_Data;
    return {
      'Content-Type': globalData['Content-Type'] || 'application/json',
      'x-zycus-tenantId': globalData['x-zycus-tenantId'],
      'x-zycus-token-id': globalData['x-zycus-token-id']
    };
  }

  static getGlobalData(key) {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error('Environment data not loaded. Call loadEnvironmentData() first.');
    }
    
    const tenantData = this.environmentData.tenants[this.currentTenant];
    if (!tenantData || !tenantData.Api_Global_Data) {
      throw new Error(`No global data configured for tenant '${this.currentTenant}'`);
    }
    
    return tenantData.Api_Global_Data[key];
  }

  static getAllGlobalDataKeys() {
    if (!this.environmentData || !this.currentTenant) {
      throw new Error('Environment data not loaded. Call loadEnvironmentData() first.');
    }
    
    const tenantData = this.environmentData.tenants[this.currentTenant];
    if (!tenantData || !tenantData.Api_Global_Data) {
      return [];
    }
    
    return Object.keys(tenantData.Api_Global_Data);
  }

  static getTenantId() {
    return this.getGlobalData('x-zycus-tenantId');
  }

  static getCompanyId() {
    return this.getGlobalData('companyId');
  }

  static getUserId() {
    return this.getGlobalData('user.id');
  }

  static getEmailAddress() {
    return this.getGlobalData('emailAddress');
  }

  static getPassword() {
    return this.getGlobalData('password');
  }

  static getTokenId() {
    return this.getGlobalData('x-zycus-token-id');
  }
}
