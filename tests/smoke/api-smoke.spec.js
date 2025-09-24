"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const flow_client_1 = require("../../src/api/flow-client");
const agent_client_1 = require("../../src/api/agent-client");
const deployment_client_1 = require("../../src/api/deployment-client");
const chat_client_1 = require("../../src/api/chat-client");
const data_generator_1 = require("../../src/utils/data-generator");
const assertions_1 = require("../../src/utils/assertions");
const helpers_1 = require("../../src/utils/helpers");
test_1.test.describe('Smoke Tests - Basic API Functionality', () => {
    let flowClient;
    let agentClient;
    let deploymentClient;
    let chatClient;
    let testContext;
    test_1.test.beforeEach(async ({ request }) => {
        flowClient = new flow_client_1.FlowClient(request);
        agentClient = new agent_client_1.AgentClient(request);
        deploymentClient = new deployment_client_1.DeploymentClient(request);
        chatClient = new chat_client_1.ChatClient(request);
        testContext = helpers_1.TestHelpers.createTestContext();
    });
    (0, test_1.test)('Smoke Test: API Health Check', async () => {
        // Test basic API connectivity by creating a simple flow
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow',
            description: 'A flow for smoke testing'
        });
        const response = await flowClient.createFlow(flowData);
        const assertions = assertions_1.CustomAssertions.runAssertions(response, [
            () => assertions_1.CustomAssertions.assertApiSuccess(response),
            () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
            () => assertions_1.CustomAssertions.assertFieldExists(response, 'data.id')
        ]);
        testContext.flowId = response.data.id;
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.data.id).toBeDefined();
    });
    (0, test_1.test)('Smoke Test: Flow CRUD Operations', async () => {
        // Create
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow CRUD',
            description: 'A flow for testing CRUD operations'
        });
        const createResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(createResponse.success).toBe(true);
        const flowId = createResponse.data.id;
        // Read
        const getResponse = await flowClient.getFlow(flowId);
        (0, test_1.expect)(getResponse.success).toBe(true);
        (0, test_1.expect)(getResponse.data.id).toBe(flowId);
        // Update
        const updateData = {
            name: 'Updated Smoke Test Flow',
            description: 'An updated flow for testing CRUD operations'
        };
        const updateResponse = await flowClient.updateFlow(flowId, updateData);
        (0, test_1.expect)(updateResponse.success).toBe(true);
        (0, test_1.expect)(updateResponse.data.name).toBe(updateData.name);
        // Delete
        const deleteResponse = await flowClient.deleteFlow(flowId);
        (0, test_1.expect)(deleteResponse.success).toBe(true);
        // Verify deletion
        const getDeletedResponse = await flowClient.getFlow(flowId);
        (0, test_1.expect)(getDeletedResponse.success).toBe(false);
        (0, test_1.expect)(getDeletedResponse.statusCode).toBe(404);
    });
    (0, test_1.test)('Smoke Test: Agent CRUD Operations', async () => {
        // Create a flow first
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow for Agent',
            description: 'A flow for testing agent CRUD operations'
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        // Create
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Smoke Test Agent',
            description: 'An agent for testing CRUD operations',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000
            }
        });
        const createResponse = await agentClient.createAgent(agentData);
        (0, test_1.expect)(createResponse.success).toBe(true);
        const agentId = createResponse.data.id;
        // Read
        const getResponse = await agentClient.getAgent(agentId);
        (0, test_1.expect)(getResponse.success).toBe(true);
        (0, test_1.expect)(getResponse.data.id).toBe(agentId);
        // Update
        const updateData = {
            name: 'Updated Smoke Test Agent',
            description: 'An updated agent for testing CRUD operations'
        };
        const updateResponse = await agentClient.updateAgent(agentId, updateData);
        (0, test_1.expect)(updateResponse.success).toBe(true);
        (0, test_1.expect)(updateResponse.data.name).toBe(updateData.name);
        // Delete
        const deleteResponse = await agentClient.deleteAgent(agentId);
        (0, test_1.expect)(deleteResponse.success).toBe(true);
        // Verify deletion
        const getDeletedResponse = await agentClient.getAgent(agentId);
        (0, test_1.expect)(getDeletedResponse.success).toBe(false);
        (0, test_1.expect)(getDeletedResponse.statusCode).toBe(404);
        // Cleanup flow
        await flowClient.deleteFlow(flowId);
    });
    (0, test_1.test)('Smoke Test: Deployment Operations', async () => {
        // Create a flow and agent first
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow for Deployment',
            description: 'A flow for testing deployment operations'
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Smoke Test Agent for Deployment',
            description: 'An agent for testing deployment operations',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000
            }
        });
        const agentResponse = await agentClient.createAgent(agentData);
        (0, test_1.expect)(agentResponse.success).toBe(true);
        const agentId = agentResponse.data.id;
        // Deploy
        const deployData = {
            agentId,
            flowId,
            environment: 'development'
        };
        const deployResponse = await deploymentClient.deployAgent(deployData);
        (0, test_1.expect)(deployResponse.success).toBe(true);
        const deploymentId = deployResponse.data.id;
        // Get deployment
        const getDeploymentResponse = await deploymentClient.getDeployment(deploymentId);
        (0, test_1.expect)(getDeploymentResponse.success).toBe(true);
        (0, test_1.expect)(getDeploymentResponse.data.id).toBe(deploymentId);
        // Cancel deployment
        const cancelResponse = await deploymentClient.cancelDeployment(deploymentId);
        (0, test_1.expect)(cancelResponse.success).toBe(true);
        // Cleanup
        await agentClient.deleteAgent(agentId);
        await flowClient.deleteFlow(flowId);
    });
    (0, test_1.test)('Smoke Test: Chat API Operations', async () => {
        // Create a flow and agent first
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow for Chat',
            description: 'A flow for testing chat operations'
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Smoke Test Agent for Chat',
            description: 'An agent for testing chat operations',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000
            }
        });
        const agentResponse = await agentClient.createAgent(agentData);
        (0, test_1.expect)(agentResponse.success).toBe(true);
        const agentId = agentResponse.data.id;
        // Deploy the agent
        const deployData = {
            agentId,
            flowId,
            environment: 'development'
        };
        const deployResponse = await deploymentClient.deployAgent(deployData);
        (0, test_1.expect)(deployResponse.success).toBe(true);
        // Wait for deployment to complete
        const deployment = await deploymentClient.waitForDeploymentCompletion(deployResponse.data.id, 60000);
        (0, test_1.expect)(deployment.status).toBe('deployed');
        // Send a chat message
        const chatData = chatClient.createTestChatRequest('Hello, this is a smoke test message', flowId, agentId);
        const chatResponse = await chatClient.sendMessage(chatData);
        (0, test_1.expect)(chatResponse.success).toBe(true);
        const messageId = chatResponse.data.id;
        // Get the message
        const getMessageResponse = await chatClient.getMessage(messageId);
        (0, test_1.expect)(getMessageResponse.success).toBe(true);
        (0, test_1.expect)(getMessageResponse.data.id).toBe(messageId);
        // Cleanup
        await deploymentClient.cancelDeployment(deployResponse.data.id);
        await agentClient.deleteAgent(agentId);
        await flowClient.deleteFlow(flowId);
    });
    (0, test_1.test)('Smoke Test: Error Handling', async () => {
        // Test 404 error
        const nonExistentFlowId = data_generator_1.DataGenerator.generateFlowId();
        const getResponse = await flowClient.getFlow(nonExistentFlowId);
        (0, test_1.expect)(getResponse.success).toBe(false);
        (0, test_1.expect)(getResponse.statusCode).toBe(404);
        // Test 400 error with invalid data
        const invalidFlowData = {
            name: '', // Empty name should fail
            description: 'Invalid flow data'
        };
        const createResponse = await flowClient.createFlow(invalidFlowData);
        (0, test_1.expect)(createResponse.success).toBe(false);
        (0, test_1.expect)(createResponse.statusCode).toBe(400);
    });
    (0, test_1.test)('Smoke Test: Data Validation', async () => {
        // Test required field validation
        const flowData = data_generator_1.DataGenerator.generateFlowData();
        delete flowData.name; // Remove required field
        const response = await flowClient.createFlow(flowData);
        (0, test_1.expect)(response.success).toBe(false);
        (0, test_1.expect)(response.statusCode).toBe(400);
    });
    (0, test_1.test)('Smoke Test: Pagination', async () => {
        // Test pagination for flows
        const response = await flowClient.getFlows(1, 5);
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        (0, test_1.expect)(response.pagination.page).toBe(1);
        (0, test_1.expect)(response.pagination.limit).toBe(5);
    });
    (0, test_1.test)('Smoke Test: Search Functionality', async () => {
        // Test search for flows
        const response = await flowClient.searchFlows('test');
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
    });
    (0, test_1.test)('Smoke Test: Statistics Endpoints', async () => {
        // Create a flow for testing statistics
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow for Statistics',
            description: 'A flow for testing statistics endpoints'
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        // Test flow statistics
        const statsResponse = await flowClient.getFlowStats(flowId);
        (0, test_1.expect)(statsResponse.success).toBe(true);
        (0, test_1.expect)(statsResponse.data).toBeDefined();
        // Cleanup
        await flowClient.deleteFlow(flowId);
    });
    (0, test_1.test)('Smoke Test: Router Agent Creation', async () => {
        // Create a flow
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow for Router Agent',
            description: 'A flow for testing router agent creation'
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        // Wait for router agent to be created
        const routerAgent = await agentClient.waitForRouterAgentCreation(flowId, 30000);
        (0, test_1.expect)(routerAgent.type).toBe('router');
        (0, test_1.expect)(routerAgent.flowId).toBe(flowId);
        // Cleanup
        await flowClient.deleteFlow(flowId);
    });
    (0, test_1.test)('Smoke Test: Multiple Environment Deployment', async () => {
        // Create a flow and agent
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Smoke Test Flow for Multi-Env',
            description: 'A flow for testing multiple environment deployments'
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Smoke Test Agent for Multi-Env',
            description: 'An agent for testing multiple environment deployments',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000
            }
        });
        const agentResponse = await agentClient.createAgent(agentData);
        (0, test_1.expect)(agentResponse.success).toBe(true);
        const agentId = agentResponse.data.id;
        // Deploy to different environments
        const environments = ['development', 'staging', 'production'];
        const deploymentIds = [];
        for (const environment of environments) {
            const deployData = {
                agentId,
                flowId,
                environment: environment
            };
            const deployResponse = await deploymentClient.deployAgent(deployData);
            (0, test_1.expect)(deployResponse.success).toBe(true);
            (0, test_1.expect)(deployResponse.data.environment).toBe(environment);
            deploymentIds.push(deployResponse.data.id);
        }
        // Cleanup
        for (const deploymentId of deploymentIds) {
            await deploymentClient.cancelDeployment(deploymentId);
        }
        await agentClient.deleteAgent(agentId);
        await flowClient.deleteFlow(flowId);
    });
    test_1.test.afterEach(async () => {
        // Cleanup any remaining test data
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
