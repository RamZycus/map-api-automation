import { expect } from '@playwright/test';
import { DataGenerator } from './data-generator';
import { CustomAssertions } from './assertions';
import { ApiResponse, TestContext, TestResult, AssertionResult } from '../types/api-types';

export class TestHelpers {
  /**
   * Create a test context with generated data
   */
  static createTestContext(): TestContext {
    return {
      flowId: DataGenerator.generateFlowId(),
      agentId: DataGenerator.generateAgentId(),
      deploymentId: DataGenerator.generateDeploymentId(),
      sessionId: DataGenerator.generateSessionId(),
      userId: DataGenerator.generateUserId(),
      testData: DataGenerator.generateMetadata()
    };
  }

  /**
   * Wait for a condition to be true
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 30000,
    interval: number = 1000
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch (error) {
        // Continue trying
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Retry an operation with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Validate API response structure
   */
  static validateApiResponse<T>(response: ApiResponse<T>): AssertionResult[] {
    const assertions: AssertionResult[] = [];
    
    // Check if response is defined
    try {
      expect(response).toBeDefined();
      assertions.push({
        description: 'Response is defined',
        status: 'passed'
      });
    } catch (error) {
      assertions.push({
        description: 'Response is defined',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check if response has required fields
    const requiredFields = ['success', 'statusCode', 'timestamp'];
    requiredFields.forEach(field => {
      try {
        expect(response).toHaveProperty(field);
        assertions.push({
          description: `Response has ${field} field`,
          status: 'passed'
        });
      } catch (error) {
        assertions.push({
          description: `Response has ${field} field`,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
    
    return assertions;
  }

  /**
   * Validate successful API response
   */
  static validateSuccessResponse<T>(response: ApiResponse<T>): AssertionResult[] {
    const assertions = this.validateApiResponse(response);
    
    // Check if response is successful
    try {
      expect(response.success).toBe(true);
      assertions.push({
        description: 'Response is successful',
        status: 'passed'
      });
    } catch (error) {
      assertions.push({
        description: 'Response is successful',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check if response has data
    try {
      expect(response.data).toBeDefined();
      assertions.push({
        description: 'Response has data',
        status: 'passed'
      });
    } catch (error) {
      assertions.push({
        description: 'Response has data',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check if response has no error
    try {
      expect(response.error).toBeUndefined();
      assertions.push({
        description: 'Response has no error',
        status: 'passed'
      });
    } catch (error) {
      assertions.push({
        description: 'Response has no error',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return assertions;
  }

  /**
   * Validate error API response
   */
  static validateErrorResponse(response: ApiResponse, expectedStatus?: number): AssertionResult[] {
    const assertions = this.validateApiResponse(response);
    
    // Check if response is not successful
    try {
      expect(response.success).toBe(false);
      assertions.push({
        description: 'Response is not successful',
        status: 'passed'
      });
    } catch (error) {
      assertions.push({
        description: 'Response is not successful',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check if response has error
    try {
      expect(response.error).toBeDefined();
      assertions.push({
        description: 'Response has error',
        status: 'passed'
      });
    } catch (error) {
      assertions.push({
        description: 'Response has error',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check status code if expected
    if (expectedStatus) {
      try {
        expect(response.statusCode).toBe(expectedStatus);
        assertions.push({
          description: `Response has status code ${expectedStatus}`,
          status: 'passed'
        });
      } catch (error) {
        assertions.push({
          description: `Response has status code ${expectedStatus}`,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return assertions;
  }

  /**
   * Generate test result from assertions
   */
  static generateTestResult(
    testName: string,
    assertions: AssertionResult[],
    duration: number,
    error?: string
  ): TestResult {
    const passedAssertions = assertions.filter(a => a.status === 'passed').length;
    const failedAssertions = assertions.filter(a => a.status === 'failed').length;
    
    return {
      testName,
      status: failedAssertions > 0 ? 'failed' : 'passed',
      duration,
      error,
      assertions,
      metadata: {
        totalAssertions: assertions.length,
        passedAssertions,
        failedAssertions,
        successRate: assertions.length > 0 ? (passedAssertions / assertions.length) * 100 : 0
      }
    };
  }

  /**
   * Log test result
   */
  static logTestResult(result: TestResult): void {
    console.log(`\n=== Test Result: ${result.testName} ===`);
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);
    
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    
    console.log(`Assertions: ${result.metadata.passedAssertions}/${result.metadata.totalAssertions} passed`);
    console.log(`Success Rate: ${result.metadata.successRate.toFixed(2)}%`);
    
    if (result.assertions.some(a => a.status === 'failed')) {
      console.log('\nFailed Assertions:');
      result.assertions
        .filter(a => a.status === 'failed')
        .forEach(assertion => {
          console.log(`  - ${assertion.description}: ${assertion.message}`);
        });
    }
    
    console.log('=====================================\n');
  }

  /**
   * Generate random delay between requests
   */
  static async randomDelay(minMs: number = 100, maxMs: number = 1000): Promise<void> {
    const delay = DataGenerator.generateNumber(minMs, maxMs);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Generate test data with variations
   */
  static generateTestDataVariations<T>(
    baseData: T,
    variations: Array<Partial<T>>
  ): T[] {
    return DataGenerator.generateTestVariations(baseData, variations);
  }

  /**
   * Generate edge case test data
   */
  static generateEdgeCaseTestData(): Record<string, any> {
    return DataGenerator.generateEdgeCaseData();
  }

  /**
   * Validate test data before sending request
   */
  static validateTestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      const value = (data as any)[field];
      if (value === undefined || value === null || value === '') {
        throw new Error(`Required field '${field}' is missing or empty`);
      }
    });
  }

  /**
   * Generate test summary
   */
  static generateTestSummary(results: TestResult[]): Record<string, any> {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'passed').length;
    const failedTests = results.filter(r => r.status === 'failed').length;
    const skippedTests = results.filter(r => r.status === 'skipped').length;
    
    const totalAssertions = results.reduce((sum, r) => sum + r.assertions.length, 0);
    const passedAssertions = results.reduce((sum, r) => sum + r.metadata.passedAssertions, 0);
    const failedAssertions = results.reduce((sum, r) => sum + r.metadata.failedAssertions, 0);
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = totalTests > 0 ? totalDuration / totalTests : 0;
    
    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0
      },
      assertions: {
        totalAssertions,
        passedAssertions,
        failedAssertions,
        successRate: totalAssertions > 0 ? (passedAssertions / totalAssertions) * 100 : 0
      },
      performance: {
        totalDuration,
        averageDuration,
        fastestTest: Math.min(...results.map(r => r.duration)),
        slowestTest: Math.max(...results.map(r => r.duration))
      },
      timestamp: DataGenerator.generateTimestamp()
    };
  }
}
