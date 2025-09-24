import * as fs from 'fs';
import * as path from 'path';

export class PayloadBuilder {
  private static jsonRepositoryPath = path.join(__dirname, '../jsonRepository');
  private static testDataPath = path.join(__dirname, '../jsonRepository/testData.json');
  
  private payload: any = {};
  private headers: any = {};
  private testData: any = {};

  constructor() {
    this.loadTestData();
  }

  /**
   * Load test data from testData.json
   */
  private loadTestData(): void {
    try {
      const data = fs.readFileSync(PayloadBuilder.testDataPath, 'utf8');
      this.testData = JSON.parse(data);
    } catch (error) {
      console.warn('Could not load test data:', error);
      this.testData = {};
    }
  }

  /**
   * Prepare default request payload from JSON repository
   */
  prepareDefaultRequest(apiName: string): PayloadBuilder {
    try {
      const filePath = path.join(PayloadBuilder.jsonRepositoryPath, `${apiName}.json`);
      const data = fs.readFileSync(filePath, 'utf8');
      this.payload = JSON.parse(data);
      console.log(`✅ Loaded default payload for API: ${apiName}`);
    } catch (error) {
      console.error(`❌ Could not load payload for API: ${apiName}`, error);
      this.payload = {};
    }
    return this;
  }

  /**
   * Set value for a field in the payload
   */
  setValue(fieldPath: string, value: any): PayloadBuilder {
    this.setNestedValue(this.payload, fieldPath, value);
    return this;
  }

  /**
   * Set header value
   */
  setHeader(headerName: string, value: any): PayloadBuilder {
    this.headers[headerName] = this.resolveValue(value);
    return this;
  }

  /**
   * Resolve value from test data or return as-is
   */
  private resolveValue(value: any): any {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
      // Handle variable substitution like {flowId}
      return value;
    }
    
    if (typeof value === 'string' && value.includes('payload.')) {
      // Handle test data reference like "payload.accessToken"
      const key = value.replace('payload.', '');
      return this.testData[key] || value;
    }
    
    return value;
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    current[lastKey] = this.resolveValue(value);
  }

  /**
   * Get the built payload
   */
  getPayload(): any {
    return this.payload;
  }

  /**
   * Get the built headers
   */
  getHeaders(): any {
    return this.headers;
  }

  /**
   * Reset the builder
   */
  reset(): PayloadBuilder {
    this.payload = {};
    this.headers = {};
    return this;
  }

  /**
   * Load test data from external source (Excel, JSON, etc.)
   */
  loadExternalTestData(dataSource: string, data: any): PayloadBuilder {
    this.testData[dataSource] = data;
    return this;
  }
}
