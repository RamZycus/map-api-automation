"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const flow_client_1 = require("../../src/api/flow-client");
const agent_client_1 = require("../../src/api/agent-client");
const data_generator_1 = require("../../src/utils/data-generator");
const assertions_1 = require("../../src/utils/assertions");
const helpers_1 = require("../../src/utils/helpers");
test_1.test.describe('Agent CRUD Operations', () => {
    let flowClient;
    let agentClient;
    let testContext;
    test_1.test.beforeEach(async ({ request }) => {
        flowClient = new flow_client_1.FlowClient(request);
        agentClient = new agent_client_1.AgentClient(request);
        testContext = helpers_1.TestHelpers.createTestContext();
    });
    test_1.test.describe('Create Agent', () => {
        (0, test_1.test)('should create a custom agent with valid data', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            // Then create an agent in the flow
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const response = await agentClient.createAgent(agentData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data.id'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', agentData.name),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.description', agentData.description),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.type', agentData.type),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.flowId', flowId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.status', agentData.status),
                () => assertions_1.CustomAssertions.assertTimestampFormat(response, 'data.createdAt'),
                () => assertions_1.CustomAssertions.assertTimestampFormat(response, 'data.updatedAt')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.name).toBe(agentData.name);
            (0, test_1.expect)(response.data.flowId).toBe(flowId);
        });
        (0, test_1.test)('should create a router agent with valid data', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            // Create a router agent
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
                type: 'router',
                configuration: {
                    routingStrategy: 'round-robin',
                    fallbackAgent: 'default'
                }
            });
            const response = await agentClient.createAgent(agentData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.type', 'router'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.configuration.routingStrategy', 'round-robin')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.type).toBe('router');
        });
        (0, test_1.test)('should create a system agent with valid data', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            // Create a system agent
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
                type: 'system',
                configuration: {
                    systemType: 'monitoring',
                    healthCheckInterval: 30000
                }
            });
            const response = await agentClient.createAgent(agentData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.type', 'system'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.configuration.systemType', 'monitoring')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.type).toBe('system');
        });
        (0, test_1.test)('should fail to create an agent with invalid data', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const invalidAgentData = data_generator_1.DataGenerator.generateInvalidAgentData();
            for (const invalidData of invalidAgentData) {
                const response = await agentClient.createAgent({
                    ...invalidData,
                    flowId
                });
                const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                    () => assertions_1.CustomAssertions.assertStatusCode(response, 400),
                    () => assertions_1.CustomAssertions.assertErrorMessage(response, 'validation error')
                ]);
                (0, test_1.expect)(response.success).toBe(false);
                (0, test_1.expect)(response.statusCode).toBe(400);
            }
            testContext.flowId = flowId;
        });
        (0, test_1.test)('should fail to create an agent in a non-existent flow', async () => {
            const nonExistentFlowId = data_generator_1.DataGenerator.generateFlowId();
            const agentData = data_generator_1.DataGenerator.generateAgentData(nonExistentFlowId);
            const response = await agentClient.createAgent(agentData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'flow not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Get Agent', () => {
        (0, test_1.test)('should get an agent by ID', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Then get the agent
            const response = await agentClient.getAgent(agentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.id', agentId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', agentData.name)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.id).toBe(agentId);
        });
        (0, test_1.test)('should get agents by flow ID', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            // Create multiple agents in the flow
            const agent1Data = data_generator_1.DataGenerator.generateAgentData(flowId);
            const agent2Data = data_generator_1.DataGenerator.generateAgentData(flowId);
            await agentClient.createAgent(agent1Data);
            await agentClient.createAgent(agent2Data);
            // Get agents by flow ID
            const response = await agentClient.getAgentsByFlowId(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 2) // Should have at least 2 agents
            ]);
            testContext.flowId = flowId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.length).toBeGreaterThanOrEqual(2);
        });
        (0, test_1.test)('should get agents by type', async () => {
            const response = await agentClient.getAgentsByType('custom');
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 0)
            ]);
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        });
        (0, test_1.test)('should get agents by status', async () => {
            const response = await agentClient.getAgentsByStatus('active');
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 0)
            ]);
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        });
        (0, test_1.test)('should search agents by name', async () => {
            const response = await agentClient.searchAgents('test');
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 0)
            ]);
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        });
        (0, test_1.test)('should fail to get a non-existent agent', async () => {
            const nonExistentAgentId = data_generator_1.DataGenerator.generateAgentId();
            const response = await agentClient.getAgent(nonExistentAgentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Update Agent', () => {
        (0, test_1.test)('should update an agent with valid data', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Then update the agent
            const updateData = {
                name: 'Updated Agent Name',
                description: 'Updated Agent Description',
                status: 'active',
                configuration: {
                    model: 'gpt-4',
                    temperature: 0.5,
                    maxTokens: 2000
                }
            };
            const response = await agentClient.updateAgent(agentId, updateData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.id', agentId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.description', updateData.description),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.status', updateData.status)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.name).toBe(updateData.name);
        });
        (0, test_1.test)('should partially update an agent', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Then partially update the agent
            const updateData = {
                name: 'Partially Updated Agent Name'
            };
            const response = await agentClient.patchAgent(agentId, updateData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.description', agentData.description) // Should remain unchanged
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.name).toBe(updateData.name);
            (0, test_1.expect)(response.data.description).toBe(agentData.description);
        });
        (0, test_1.test)('should fail to update a non-existent agent', async () => {
            const nonExistentAgentId = data_generator_1.DataGenerator.generateAgentId();
            const updateData = {
                name: 'Updated Agent Name'
            };
            const response = await agentClient.updateAgent(nonExistentAgentId, updateData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Delete Agent', () => {
        (0, test_1.test)('should delete an agent successfully', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Then delete the agent
            const response = await agentClient.deleteAgent(agentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200)
            ]);
            testContext.flowId = flowId;
            (0, test_1.expect)(response.success).toBe(true);
        });
        (0, test_1.test)('should fail to delete a non-existent agent', async () => {
            const nonExistentAgentId = data_generator_1.DataGenerator.generateAgentId();
            const response = await agentClient.deleteAgent(nonExistentAgentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
        (0, test_1.test)('should verify agent is deleted by trying to get it', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Delete the agent
            await agentClient.deleteAgent(agentId);
            // Try to get the deleted agent
            const response = await agentClient.getAgent(agentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            testContext.flowId = flowId;
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Router Agent', () => {
        (0, test_1.test)('should get router agent for a flow', async () => {
            // First create a flow
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            // Wait for router agent to be created (this happens automatically when a flow is created)
            const routerAgent = await agentClient.waitForRouterAgentCreation(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: routerAgent, statusCode: 200, timestamp: new Date().toISOString() }, [
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: routerAgent, statusCode: 200, timestamp: new Date().toISOString() }, 'data.type', 'router'),
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: routerAgent, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = routerAgent.id;
            (0, test_1.expect)(routerAgent.type).toBe('router');
            (0, test_1.expect)(routerAgent.flowId).toBe(flowId);
        });
        (0, test_1.test)('should fail to get router agent for non-existent flow', async () => {
            const nonExistentFlowId = data_generator_1.DataGenerator.generateFlowId();
            const response = await agentClient.getRouterAgent(nonExistentFlowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Agent Statistics', () => {
        (0, test_1.test)('should get agent statistics', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Get agent statistics
            const response = await agentClient.getAgentStats(agentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data).toBeDefined();
        });
    });
    test_1.test.afterEach(async () => {
        // Cleanup: Delete the agent and flow if they were created
        if (testContext.agentId) {
            try {
                await agentClient.deleteAgent(testContext.agentId);
            }
            catch (error) {
                console.log(`Failed to cleanup agent ${testContext.agentId}:`, error);
            }
        }
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
