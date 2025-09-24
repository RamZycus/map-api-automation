import { expect } from '@playwright/test';
import { ApiResponse, AssertionResult } from '../types/api-types';

export class CustomAssertions {
  /**
   * Assert that an API response is successful
   */
  static assertApiSuccess<T>(response: ApiResponse<T>): AssertionResult {
    try {
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.statusCode).toBeGreaterThanOrEqual(200);
      expect(response.statusCode).toBeLessThan(300);
      expect(response.data).toBeDefined();
      expect(response.error).toBeUndefined();
      
      return {
        description: 'API response is successful',
        status: 'passed',
        expected: 'success: true, statusCode: 2xx',
        actual: `success: ${response.success}, statusCode: ${response.statusCode}`
      };
    } catch (error) {
      return {
        description: 'API response is successful',
        status: 'failed',
        expected: 'success: true, statusCode: 2xx',
        actual: `success: ${response.success}, statusCode: ${response.statusCode}`,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific status code
   */
  static assertStatusCode(response: ApiResponse, expectedStatusCode: number): AssertionResult {
    try {
      expect(response.statusCode).toBe(expectedStatusCode);
      
      return {
        description: `API response has status code ${expectedStatusCode}`,
        status: 'passed',
        expected: expectedStatusCode,
        actual: response.statusCode
      };
    } catch (error) {
      return {
        description: `API response has status code ${expectedStatusCode}`,
        status: 'failed',
        expected: expectedStatusCode,
        actual: response.statusCode,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response contains specific data
   */
  static assertResponseData<T>(response: ApiResponse<T>, expectedData: Partial<T>): AssertionResult {
    try {
      expect(response.data).toEqual(expect.objectContaining(expectedData));
      
      return {
        description: 'API response contains expected data',
        status: 'passed',
        expected: expectedData,
        actual: response.data
      };
    } catch (error) {
      return {
        description: 'API response contains expected data',
        status: 'failed',
        expected: expectedData,
        actual: response.data,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific field
   */
  static assertFieldExists<T>(response: ApiResponse<T>, fieldPath: string): AssertionResult {
    try {
      const fieldValue = this.getNestedField(response.data, fieldPath);
      expect(fieldValue).toBeDefined();
      
      return {
        description: `API response has field ${fieldPath}`,
        status: 'passed',
        expected: 'field exists',
        actual: fieldValue
      };
    } catch (error) {
      return {
        description: `API response has field ${fieldPath}`,
        status: 'failed',
        expected: 'field exists',
        actual: 'field not found',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific field value
   */
  static assertFieldValue<T>(response: ApiResponse<T>, fieldPath: string, expectedValue: any): AssertionResult {
    try {
      const fieldValue = this.getNestedField(response.data, fieldPath);
      expect(fieldValue).toBe(expectedValue);
      
      return {
        description: `API response field ${fieldPath} has expected value`,
        status: 'passed',
        expected: expectedValue,
        actual: fieldValue
      };
    } catch (error) {
      return {
        description: `API response field ${fieldPath} has expected value`,
        status: 'failed',
        expected: expectedValue,
        actual: this.getNestedField(response.data, fieldPath),
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific field type
   */
  static assertFieldType<T>(response: ApiResponse<T>, fieldPath: string, expectedType: string): AssertionResult {
    try {
      const fieldValue = this.getNestedField(response.data, fieldPath);
      expect(typeof fieldValue).toBe(expectedType);
      
      return {
        description: `API response field ${fieldPath} has expected type ${expectedType}`,
        status: 'passed',
        expected: expectedType,
        actual: typeof fieldValue
      };
    } catch (error) {
      return {
        description: `API response field ${fieldPath} has expected type ${expectedType}`,
        status: 'failed',
        expected: expectedType,
        actual: typeof this.getNestedField(response.data, fieldPath),
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific array length
   */
  static assertArrayLength<T>(response: ApiResponse<T[]>, expectedLength: number): AssertionResult {
    try {
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(expectedLength);
      
      return {
        description: `API response array has length ${expectedLength}`,
        status: 'passed',
        expected: expectedLength,
        actual: response.data.length
      };
    } catch (error) {
      return {
        description: `API response array has length ${expectedLength}`,
        status: 'failed',
        expected: expectedLength,
        actual: Array.isArray(response.data) ? response.data.length : 'not an array',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific array minimum length
   */
  static assertArrayMinLength<T>(response: ApiResponse<T[]>, minLength: number): AssertionResult {
    try {
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(minLength);
      
      return {
        description: `API response array has minimum length ${minLength}`,
        status: 'passed',
        expected: `>= ${minLength}`,
        actual: response.data.length
      };
    } catch (error) {
      return {
        description: `API response array has minimum length ${minLength}`,
        status: 'failed',
        expected: `>= ${minLength}`,
        actual: Array.isArray(response.data) ? response.data.length : 'not an array',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response contains a specific item in an array
   */
  static assertArrayContains<T>(response: ApiResponse<T[]>, expectedItem: Partial<T>): AssertionResult {
    try {
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toContainEqual(expect.objectContaining(expectedItem));
      
      return {
        description: 'API response array contains expected item',
        status: 'passed',
        expected: expectedItem,
        actual: 'item found in array'
      };
    } catch (error) {
      return {
        description: 'API response array contains expected item',
        status: 'failed',
        expected: expectedItem,
        actual: 'item not found in array',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific timestamp format
   */
  static assertTimestampFormat(response: ApiResponse, fieldPath: string = 'timestamp'): AssertionResult {
    try {
      const timestamp = this.getNestedField(response, fieldPath);
      expect(timestamp).toBeDefined();
      expect(new Date(timestamp).getTime()).not.toBeNaN();
      
      return {
        description: `API response has valid timestamp format in ${fieldPath}`,
        status: 'passed',
        expected: 'valid ISO timestamp',
        actual: timestamp
      };
    } catch (error) {
      return {
        description: `API response has valid timestamp format in ${fieldPath}`,
        status: 'failed',
        expected: 'valid ISO timestamp',
        actual: this.getNestedField(response, fieldPath),
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Assert that an API response has a specific error message
   */
  static assertErrorMessage(response: ApiResponse, expectedError: string): AssertionResult {
    try {
      expect(response.success).toBe(false);
      expect(response.error).toContain(expectedError);
      
      return {
        description: `API response has expected error message: ${expectedError}`,
        status: 'passed',
        expected: expectedError,
        actual: response.error
      };
    } catch (error) {
      return {
        description: `API response has expected error message: ${expectedError}`,
        status: 'failed',
        expected: expectedError,
        actual: response.error,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get nested field value from an object using dot notation
   */
  private static getNestedField(obj: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((current, field) => {
      if (current && typeof current === 'object') {
        return current[field];
      }
      return undefined;
    }, obj);
  }

  /**
   * Run multiple assertions and return combined results
   */
  static runAssertions<T>(response: ApiResponse<T>, assertions: Array<() => AssertionResult>): AssertionResult[] {
    return assertions.map(assertion => {
      try {
        return assertion();
      } catch (error) {
        return {
          description: 'Assertion execution failed',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  }
}
