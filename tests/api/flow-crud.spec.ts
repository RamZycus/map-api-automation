import { test, expect } from '@playwright/test';
import { FlowClient } from '../../src/api/flow-client';
import { DataGenerator } from '../../src/utils/data-generator';
import { CustomAssertions } from '../../src/utils/assertions';
import { TestHelpers } from '../../src/utils/helpers';
import { CreateFlowRequest, Flow } from '../../src/types/api-types';

test.describe('Flow CRUD Operations', () => {
  let flowClient: FlowClient;
  let testContext: any;

  test.beforeEach(async ({ request }) => {
    flowClient = new FlowClient(request);
    testContext = TestHelpers.createTestContext();
  });

  test.describe('Create Flow', () => {
    test('should create a flow with valid data', async () => {
      const flowData = DataGenerator.generateFlowData();
      
      const response = await flowClient.createFlow(flowData);
      
      // Validate response structure
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldExists(response, 'data.id'),
        () => CustomAssertions.assertFieldValue(response, 'data.name', flowData.name),
        () => CustomAssertions.assertFieldValue(response, 'data.description', flowData.description),
        () => CustomAssertions.assertFieldValue(response, 'data.status', flowData.status),
        () => CustomAssertions.assertTimestampFormat(response, 'data.createdAt'),
        () => CustomAssertions.assertTimestampFormat(response, 'data.updatedAt')
      ]);

      // Log test result
      const testResult = TestHelpers.generateTestResult(
        'Create Flow - Valid Data',
        assertions,
        Date.now()
      );
      TestHelpers.logTestResult(testResult);

      // Store flow ID for cleanup
      testContext.flowId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.name).toBe(flowData.name);
    });

    test('should create a flow with minimal required data', async () => {
      const flowData: CreateFlowRequest = {
        name: DataGenerator.generateFlowName(),
        description: DataGenerator.generateFlowDescription()
      };
      
      const response = await flowClient.createFlow(flowData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldValue(response, 'data.name', flowData.name),
        () => CustomAssertions.assertFieldValue(response, 'data.description', flowData.description),
        () => CustomAssertions.assertFieldValue(response, 'data.status', 'active') // Default status
      ]);

      testContext.flowId = response.data.id;
      
      expect(response.success).toBe(true);
    });

    test('should fail to create a flow with invalid data', async () => {
      const invalidFlowData = DataGenerator.generateInvalidFlowData();
      
      for (const invalidData of invalidFlowData) {
        const response = await flowClient.createFlow(invalidData as CreateFlowRequest);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertStatusCode(response, 400),
          () => CustomAssertions.assertErrorMessage(response, 'validation error')
        ]);

        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(400);
      }
    });

    test('should create a flow with custom tags and metadata', async () => {
      const flowData = DataGenerator.generateFlowData({
        tags: ['automation', 'test', 'api'],
        metadata: {
          environment: 'test',
          createdBy: 'automation-framework',
          version: '1.0.0'
        }
      });
      
      const response = await flowClient.createFlow(flowData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertFieldValue(response, 'data.tags', flowData.tags),
        () => CustomAssertions.assertFieldValue(response, 'data.metadata', flowData.metadata)
      ]);

      testContext.flowId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.tags).toEqual(flowData.tags);
      expect(response.data.metadata).toEqual(flowData.metadata);
    });
  });

  test.describe('Get Flow', () => {
    test('should get a flow by ID', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const createResponse = await flowClient.createFlow(flowData);
      const flowId = createResponse.data.id;
      
      // Then get the flow
      const response = await flowClient.getFlow(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.id', flowId),
        () => CustomAssertions.assertFieldValue(response, 'data.name', flowData.name)
      ]);

      testContext.flowId = flowId;
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(flowId);
    });

    test('should fail to get a non-existent flow', async () => {
      const nonExistentFlowId = DataGenerator.generateFlowId();
      
      const response = await flowClient.getFlow(nonExistentFlowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });

    test('should get all flows with pagination', async () => {
      const response = await flowClient.getFlows(1, 10);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldExists(response, 'data'),
        () => CustomAssertions.assertFieldExists(response, 'pagination'),
        () => CustomAssertions.assertFieldValue(response, 'pagination.page', 1),
        () => CustomAssertions.assertFieldValue(response, 'pagination.limit', 10)
      ]);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('should get flows by status', async () => {
      const response = await flowClient.getFlowsByStatus('active');
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 0)
      ]);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('should search flows by name', async () => {
      const response = await flowClient.searchFlows('test');
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 0)
      ]);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  test.describe('Update Flow', () => {
    test('should update a flow with valid data', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const createResponse = await flowClient.createFlow(flowData);
      const flowId = createResponse.data.id;
      
      // Then update the flow
      const updateData = {
        name: 'Updated Flow Name',
        description: 'Updated Flow Description',
        status: 'inactive' as const
      };
      
      const response = await flowClient.updateFlow(flowId, updateData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.id', flowId),
        () => CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
        () => CustomAssertions.assertFieldValue(response, 'data.description', updateData.description),
        () => CustomAssertions.assertFieldValue(response, 'data.status', updateData.status)
      ]);

      testContext.flowId = flowId;
      
      expect(response.success).toBe(true);
      expect(response.data.name).toBe(updateData.name);
    });

    test('should partially update a flow', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const createResponse = await flowClient.createFlow(flowData);
      const flowId = createResponse.data.id;
      
      // Then partially update the flow
      const updateData = {
        name: 'Partially Updated Flow Name'
      };
      
      const response = await flowClient.patchFlow(flowId, updateData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
        () => CustomAssertions.assertFieldValue(response, 'data.description', flowData.description) // Should remain unchanged
      ]);

      testContext.flowId = flowId;
      
      expect(response.success).toBe(true);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.description).toBe(flowData.description);
    });

    test('should fail to update a non-existent flow', async () => {
      const nonExistentFlowId = DataGenerator.generateFlowId();
      const updateData = {
        name: 'Updated Flow Name'
      };
      
      const response = await flowClient.updateFlow(nonExistentFlowId, updateData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Delete Flow', () => {
    test('should delete a flow successfully', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const createResponse = await flowClient.createFlow(flowData);
      const flowId = createResponse.data.id;
      
      // Then delete the flow
      const response = await flowClient.deleteFlow(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200)
      ]);

      expect(response.success).toBe(true);
    });

    test('should fail to delete a non-existent flow', async () => {
      const nonExistentFlowId = DataGenerator.generateFlowId();
      
      const response = await flowClient.deleteFlow(nonExistentFlowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });

    test('should verify flow is deleted by trying to get it', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const createResponse = await flowClient.createFlow(flowData);
      const flowId = createResponse.data.id;
      
      // Delete the flow
      await flowClient.deleteFlow(flowId);
      
      // Try to get the deleted flow
      const response = await flowClient.getFlow(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Flow Statistics', () => {
    test('should get flow statistics', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const createResponse = await flowClient.createFlow(flowData);
      const flowId = createResponse.data.id;
      
      // Get flow statistics
      const response = await flowClient.getFlowStats(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldExists(response, 'data')
      ]);

      testContext.flowId = flowId;
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });
  });

  test.afterEach(async () => {
    // Cleanup: Delete the flow if it was created
    if (testContext.flowId) {
      try {
        await flowClient.deleteFlow(testContext.flowId);
      } catch (error) {
        console.log(`Failed to cleanup flow ${testContext.flowId}:`, error);
      }
    }
  });
});
