"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const flow_client_1 = require("../../src/api/flow-client");
const data_generator_1 = require("../../src/utils/data-generator");
const assertions_1 = require("../../src/utils/assertions");
const helpers_1 = require("../../src/utils/helpers");
test_1.test.describe('Flow CRUD Operations', () => {
    let flowClient;
    let testContext;
    test_1.test.beforeEach(async ({ request }) => {
        flowClient = new flow_client_1.FlowClient(request);
        testContext = helpers_1.TestHelpers.createTestContext();
    });
    test_1.test.describe('Create Flow', () => {
        (0, test_1.test)('should create a flow with valid data', async () => {
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const response = await flowClient.createFlow(flowData);
            // Validate response structure
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data.id'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', flowData.name),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.description', flowData.description),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.status', flowData.status),
                () => assertions_1.CustomAssertions.assertTimestampFormat(response, 'data.createdAt'),
                () => assertions_1.CustomAssertions.assertTimestampFormat(response, 'data.updatedAt')
            ]);
            // Log test result
            const testResult = helpers_1.TestHelpers.generateTestResult('Create Flow - Valid Data', assertions, Date.now());
            helpers_1.TestHelpers.logTestResult(testResult);
            // Store flow ID for cleanup
            testContext.flowId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.name).toBe(flowData.name);
        });
        (0, test_1.test)('should create a flow with minimal required data', async () => {
            const flowData = {
                name: data_generator_1.DataGenerator.generateFlowName(),
                description: data_generator_1.DataGenerator.generateFlowDescription()
            };
            const response = await flowClient.createFlow(flowData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', flowData.name),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.description', flowData.description),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.status', 'active') // Default status
            ]);
            testContext.flowId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
        });
        (0, test_1.test)('should fail to create a flow with invalid data', async () => {
            const invalidFlowData = data_generator_1.DataGenerator.generateInvalidFlowData();
            for (const invalidData of invalidFlowData) {
                const response = await flowClient.createFlow(invalidData);
                const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                    () => assertions_1.CustomAssertions.assertStatusCode(response, 400),
                    () => assertions_1.CustomAssertions.assertErrorMessage(response, 'validation error')
                ]);
                (0, test_1.expect)(response.success).toBe(false);
                (0, test_1.expect)(response.statusCode).toBe(400);
            }
        });
        (0, test_1.test)('should create a flow with custom tags and metadata', async () => {
            const flowData = data_generator_1.DataGenerator.generateFlowData({
                tags: ['automation', 'test', 'api'],
                metadata: {
                    environment: 'test',
                    createdBy: 'automation-framework',
                    version: '1.0.0'
                }
            });
            const response = await flowClient.createFlow(flowData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.tags', flowData.tags),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.metadata', flowData.metadata)
            ]);
            testContext.flowId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.tags).toEqual(flowData.tags);
            (0, test_1.expect)(response.data.metadata).toEqual(flowData.metadata);
        });
    });
    test_1.test.describe('Get Flow', () => {
        (0, test_1.test)('should get a flow by ID', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const createResponse = await flowClient.createFlow(flowData);
            const flowId = createResponse.data.id;
            // Then get the flow
            const response = await flowClient.getFlow(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.id', flowId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', flowData.name)
            ]);
            testContext.flowId = flowId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.id).toBe(flowId);
        });
        (0, test_1.test)('should fail to get a non-existent flow', async () => {
            const nonExistentFlowId = data_generator_1.DataGenerator.generateFlowId();
            const response = await flowClient.getFlow(nonExistentFlowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
        (0, test_1.test)('should get all flows with pagination', async () => {
            const response = await flowClient.getFlows(1, 10);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data'),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'pagination'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'pagination.page', 1),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'pagination.limit', 10)
            ]);
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        });
        (0, test_1.test)('should get flows by status', async () => {
            const response = await flowClient.getFlowsByStatus('active');
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 0)
            ]);
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        });
        (0, test_1.test)('should search flows by name', async () => {
            const response = await flowClient.searchFlows('test');
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 0)
            ]);
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        });
    });
    test_1.test.describe('Update Flow', () => {
        (0, test_1.test)('should update a flow with valid data', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const createResponse = await flowClient.createFlow(flowData);
            const flowId = createResponse.data.id;
            // Then update the flow
            const updateData = {
                name: 'Updated Flow Name',
                description: 'Updated Flow Description',
                status: 'inactive'
            };
            const response = await flowClient.updateFlow(flowId, updateData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.id', flowId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.description', updateData.description),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.status', updateData.status)
            ]);
            testContext.flowId = flowId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.name).toBe(updateData.name);
        });
        (0, test_1.test)('should partially update a flow', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const createResponse = await flowClient.createFlow(flowData);
            const flowId = createResponse.data.id;
            // Then partially update the flow
            const updateData = {
                name: 'Partially Updated Flow Name'
            };
            const response = await flowClient.patchFlow(flowId, updateData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.description', flowData.description) // Should remain unchanged
            ]);
            testContext.flowId = flowId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.name).toBe(updateData.name);
            (0, test_1.expect)(response.data.description).toBe(flowData.description);
        });
        (0, test_1.test)('should fail to update a non-existent flow', async () => {
            const nonExistentFlowId = data_generator_1.DataGenerator.generateFlowId();
            const updateData = {
                name: 'Updated Flow Name'
            };
            const response = await flowClient.updateFlow(nonExistentFlowId, updateData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Delete Flow', () => {
        (0, test_1.test)('should delete a flow successfully', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const createResponse = await flowClient.createFlow(flowData);
            const flowId = createResponse.data.id;
            // Then delete the flow
            const response = await flowClient.deleteFlow(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200)
            ]);
            (0, test_1.expect)(response.success).toBe(true);
        });
        (0, test_1.test)('should fail to delete a non-existent flow', async () => {
            const nonExistentFlowId = data_generator_1.DataGenerator.generateFlowId();
            const response = await flowClient.deleteFlow(nonExistentFlowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
        (0, test_1.test)('should verify flow is deleted by trying to get it', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const createResponse = await flowClient.createFlow(flowData);
            const flowId = createResponse.data.id;
            // Delete the flow
            await flowClient.deleteFlow(flowId);
            // Try to get the deleted flow
            const response = await flowClient.getFlow(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Flow Statistics', () => {
        (0, test_1.test)('should get flow statistics', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const createResponse = await flowClient.createFlow(flowData);
            const flowId = createResponse.data.id;
            // Get flow statistics
            const response = await flowClient.getFlowStats(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data')
            ]);
            testContext.flowId = flowId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data).toBeDefined();
        });
    });
    test_1.test.afterEach(async () => {
        // Cleanup: Delete the flow if it was created
        if (testContext.flowId) {
            try {
                await flowClient.deleteFlow(testContext.flowId);
            }
            catch (error) {
                console.log(`Failed to cleanup flow ${testContext.flowId}:`, error);
            }
        }
    });
});
