import { APIRequestContext } from '@playwright/test';
// import { getEnvironment } from '../../config/environment';
import { PayloadBuilder } from './PayloadBuilder';
import chalk from 'chalk';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}

export class EnhancedApiHelper {
  protected request: APIRequestContext;
  protected baseUrl: string;
  protected payloadBuilder: PayloadBuilder;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    this.payloadBuilder = new PayloadBuilder();
  }

  /**
   * Prepare default request for an API
   */
  prepareDefaultRequest(apiName: string): EnhancedApiHelper {
    this.payloadBuilder.prepareDefaultRequest(apiName);
    return this;
  }

  /**
   * Set value for a field in the payload
   */
  setValue(fieldPath: string, value: any): EnhancedApiHelper {
    this.payloadBuilder.setValue(fieldPath, value);
    return this;
  }

  /**
   * Set header value
   */
  setHeader(headerName: string, value: any): EnhancedApiHelper {
    this.payloadBuilder.setHeader(headerName, value);
    return this;
  }

  /**
   * Submit GET request
   */
  async submitGetRequest(apiName: string): Promise<ApiResponse> {
    const url = this.buildUrl(apiName);
    const headers = this.payloadBuilder.getHeaders();
    
    console.log(chalk.blue.bold('🔍 GET REQUEST'));
    console.log(chalk.cyan('📍 URL:'), chalk.white(url));
    console.log(chalk.yellow('📋 Headers:'), JSON.stringify(headers, null, 2));
    console.log(chalk.gray('─'.repeat(80)));
    
    const response = await this.request.get(url, { headers });
    return this.handleResponse(response);
  }

  /**
   * Submit POST request
   */
  async submitPostRequest(apiName: string): Promise<ApiResponse> {
    const url = this.buildUrl(apiName);
    const payload = this.payloadBuilder.getPayload();
    const headers = this.payloadBuilder.getHeaders();
    
    console.log(chalk.green.bold('📤 POST REQUEST'));
    console.log(chalk.cyan('📍 URL:'), chalk.white(url));
    console.log(chalk.yellow('📋 Headers:'), JSON.stringify(headers, null, 2));
    console.log(chalk.magenta('📦 Payload:'), JSON.stringify(payload, null, 2));
    console.log(chalk.gray('─'.repeat(80)));
    
    const response = await this.request.post(url, { 
      data: payload, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return this.handleResponse(response);
  }

  /**
   * Submit PUT request
   */
  async submitPutRequest(apiName: string): Promise<ApiResponse> {
    const url = this.buildUrl(apiName);
    const payload = this.payloadBuilder.getPayload();
    const headers = this.payloadBuilder.getHeaders();
    
    console.log(chalk.yellow.bold('📝 PUT REQUEST'));
    console.log(chalk.cyan('📍 URL:'), chalk.white(url));
    console.log(chalk.yellow('📋 Headers:'), JSON.stringify(headers, null, 2));
    console.log(chalk.magenta('📦 Payload:'), JSON.stringify(payload, null, 2));
    console.log(chalk.gray('─'.repeat(80)));
    
    const response = await this.request.put(url, { 
      data: payload, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return this.handleResponse(response);
  }

  /**
   * Submit DELETE request
   */
  async submitDeleteRequest(apiName: string): Promise<ApiResponse> {
    const url = this.buildUrl(apiName);
    const payload = this.payloadBuilder.getPayload();
    const headers = this.payloadBuilder.getHeaders();
    
    console.log(chalk.red.bold('🗑️ DELETE REQUEST'));
    console.log(chalk.cyan('📍 URL:'), chalk.white(url));
    console.log(chalk.yellow('📋 Headers:'), JSON.stringify(headers, null, 2));
    console.log(chalk.magenta('📦 Payload:'), JSON.stringify(payload, null, 2));
    console.log(chalk.gray('─'.repeat(80)));
    
    const response = await this.request.delete(url, { 
      data: payload, 
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    return this.handleResponse(response);
  }

  /**
   * Build URL for API
   */
  private buildUrl(apiName: string): string {
    const apiEndpoints: { [key: string]: string } = {
      'createAgentPost': '/map-bk/api/v1/agents',
      'createFlowPost': '/map-bk/api/v1/flows',
      'deleteAgentPost': '/map-bk/api/v1/agents',
      'deleteFlowPost': '/map-bk/api/v1/flows',
      'getAgent': '/map-bk/api/v1/agents',
      'getFlow': '/map-bk/api/v1/flows',
      'getAgentsByFlowId': '/map-bk/api/v1/agents',
      'getAgentById': '/map-bk/api/v1/agents',
      'chatApiPost': '/maf-ai/chat'
    };
    
    const endpoint = apiEndpoints[apiName];
    if (!endpoint) {
      throw new Error(`Unknown API: ${apiName}`);
    }
    
    let url = `${this.baseUrl}${endpoint}`;
    
    // Handle specific endpoints that need IDs
    if (apiName === 'getAgentById') {
      const agentId = this.payloadBuilder.getPayload().agentId;
      if (agentId) {
        url = `${url}/${agentId}`;
      }
    } else if (apiName === 'getAgentsByFlowId') {
      const flowId = this.payloadBuilder.getPayload().flowId;
      if (flowId) {
        url = `${url}?flowId=${flowId}`;
      }
    } else if (apiName === 'chatApiPost') {
      // Chat API uses different base URL
      url = `http://hpx-up1.app.inmu.qc.zycus.local:39403${endpoint}`;
    }
    
    return url;
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: any): Promise<ApiResponse> {
    const status = response.status();
    const headers = response.headers();
    const contentType = headers['content-type'] || '';

    let data: any;
    
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (error) {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }
    
    // Enhanced colored response logging
    const isSuccess = status >= 200 && status < 300;
    const statusColor = isSuccess ? chalk.green : chalk.red;
    const statusIcon = isSuccess ? '✅' : '❌';
    
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.bold(`${statusIcon} RESPONSE`));
    console.log(chalk.cyan('📊 Status Code:'), statusColor.bold(status));
    console.log(chalk.cyan('⏱️  Timestamp:'), chalk.white(new Date().toISOString()));
    console.log(chalk.cyan('📋 Response Headers:'), JSON.stringify(headers, null, 2));
    console.log(chalk.cyan('📄 Response Body:'), JSON.stringify(data, null, 2));
    console.log(chalk.gray('═'.repeat(80)));
    
    return {
      success: isSuccess,
      data: data,
      statusCode: status,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset the helper
   */
  reset(): EnhancedApiHelper {
    this.payloadBuilder.reset();
    return this;
  }
}
