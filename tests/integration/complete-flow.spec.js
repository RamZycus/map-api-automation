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
test_1.test.describe('Complete Agent Creation Flow Integration', () => {
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
    (0, test_1.test)('Complete Flow: Create Flow → Create Agent → Deploy → Chat → Validate Response', async () => {
        // Step 1: Create a flow
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Integration Test Flow',
            description: 'A flow for integration testing',
            tags: ['integration', 'test', 'automation']
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        // Step 2: Create a custom agent in the flow
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Integration Test Agent',
            description: 'An agent for integration testing',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000,
                systemPrompt: 'You are a helpful assistant for integration testing.'
            }
        });
        const agentResponse = await agentClient.createAgent(agentData);
        (0, test_1.expect)(agentResponse.success).toBe(true);
        const agentId = agentResponse.data.id;
        // Step 3: Deploy the agent to development environment
        const deployData = {
            agentId,
            flowId,
            environment: 'development',
            metadata: {
                deployedBy: 'integration-test',
                version: '1.0.0',
                environment: 'test'
            }
        };
        const deployResponse = await deploymentClient.deployAgent(deployData);
        (0, test_1.expect)(deployResponse.success).toBe(true);
        const deploymentId = deployResponse.data.id;
        // Step 4: Wait for deployment to complete
        const deployment = await deploymentClient.waitForDeploymentCompletion(deploymentId, 60000);
        (0, test_1.expect)(deployment.status).toBe('deployed');
        // Step 5: Send a chat message
        const chatData = chatClient.createTestChatRequest('Hello, this is an integration test message. Please respond with a simple greeting.', flowId, agentId);
        const chatResponse = await chatClient.sendMessage(chatData);
        (0, test_1.expect)(chatResponse.success).toBe(true);
        const messageId = chatResponse.data.id;
        // Step 6: Wait for Ably response and validate
        const response = await chatClient.waitForAblyResponse(messageId, 30000);
        // Validate the complete response
        const assertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
            () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
            () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId', agentId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.userId', chatData.userId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.sessionId', chatData.sessionId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'success'),
            () => assertions_1.CustomAssertions.assertTimestampFormat({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.timestamp')
        ]);
        // Log test result
        const testResult = helpers_1.TestHelpers.generateTestResult('Complete Agent Creation Flow Integration', assertions, Date.now());
        helpers_1.TestHelpers.logTestResult(testResult);
        // Store IDs for cleanup
        testContext.flowId = flowId;
        testContext.agentId = agentId;
        testContext.deploymentId = deploymentId;
        // Final assertions
        (0, test_1.expect)(response.id).toBeDefined();
        (0, test_1.expect)(response.response).toBeDefined();
        (0, test_1.expect)(response.flowId).toBe(flowId);
        (0, test_1.expect)(response.agentId).toBe(agentId);
        (0, test_1.expect)(response.status).toBe('success');
        (0, test_1.expect)(response.processingTime).toBeGreaterThan(0);
    });
    (0, test_1.test)('Complete Flow: Create Flow → Create Multiple Agents → Deploy → Chat → Validate Responses', async () => {
        // Step 1: Create a flow
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Multi-Agent Integration Test Flow',
            description: 'A flow for testing multiple agents',
            tags: ['integration', 'multi-agent', 'test']
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        // Step 2: Create multiple agents
        const agent1Data = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Customer Service Agent',
            description: 'Handles customer service inquiries',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                maxTokens: 500,
                systemPrompt: 'You are a helpful customer service representative.'
            }
        });
        const agent2Data = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Technical Support Agent',
            description: 'Handles technical support requests',
            type: 'custom',
            configuration: {
                model: 'gpt-4',
                temperature: 0.2,
                maxTokens: 1000,
                systemPrompt: 'You are a technical support specialist.'
            }
        });
        const agent1Response = await agentClient.createAgent(agent1Data);
        (0, test_1.expect)(agent1Response.success).toBe(true);
        const agent1Id = agent1Response.data.id;
        const agent2Response = await agentClient.createAgent(agent2Data);
        (0, test_1.expect)(agent2Response.success).toBe(true);
        const agent2Id = agent2Response.data.id;
        // Step 3: Deploy both agents
        const deploy1Data = {
            agentId: agent1Id,
            flowId,
            environment: 'development'
        };
        const deploy2Data = {
            agentId: agent2Id,
            flowId,
            environment: 'development'
        };
        const deploy1Response = await deploymentClient.deployAgent(deploy1Data);
        (0, test_1.expect)(deploy1Response.success).toBe(true);
        const deploy2Response = await deploymentClient.deployAgent(deploy2Data);
        (0, test_1.expect)(deploy2Response.success).toBe(true);
        // Step 4: Wait for deployments to complete
        const deployment1 = await deploymentClient.waitForDeploymentCompletion(deploy1Response.data.id, 60000);
        (0, test_1.expect)(deployment1.status).toBe('deployed');
        const deployment2 = await deploymentClient.waitForDeploymentCompletion(deploy2Response.data.id, 60000);
        (0, test_1.expect)(deployment2.status).toBe('deployed');
        // Step 5: Send chat messages to both agents
        const chat1Data = chatClient.createTestChatRequest('I need help with my account. Can you assist me?', flowId, agent1Id);
        const chat2Data = chatClient.createTestChatRequest('I am having technical issues with the application. Can you help?', flowId, agent2Id);
        const chat1Response = await chatClient.sendMessage(chat1Data);
        (0, test_1.expect)(chat1Response.success).toBe(true);
        const chat2Response = await chatClient.sendMessage(chat2Data);
        (0, test_1.expect)(chat2Response.success).toBe(true);
        // Step 6: Wait for responses from both agents
        const response1 = await chatClient.waitForAblyResponse(chat1Response.data.id, 30000);
        const response2 = await chatClient.waitForAblyResponse(chat2Response.data.id, 30000);
        // Validate both responses
        (0, test_1.expect)(response1.agentId).toBe(agent1Id);
        (0, test_1.expect)(response1.flowId).toBe(flowId);
        (0, test_1.expect)(response1.status).toBe('success');
        (0, test_1.expect)(response2.agentId).toBe(agent2Id);
        (0, test_1.expect)(response2.flowId).toBe(flowId);
        (0, test_1.expect)(response2.status).toBe('success');
        // Store IDs for cleanup
        testContext.flowId = flowId;
        testContext.agentIds = [agent1Id, agent2Id];
        testContext.deploymentIds = [deploy1Response.data.id, deploy2Response.data.id];
    });
    (0, test_1.test)('Complete Flow: Create Flow → Deploy → Promote → Chat → Validate Response', async () => {
        // Step 1: Create a flow
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Promotion Test Flow',
            description: 'A flow for testing promotion workflow',
            tags: ['integration', 'promotion', 'test']
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        // Step 2: Create an agent
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Promotion Test Agent',
            description: 'An agent for testing promotion workflow',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.5,
                maxTokens: 800
            }
        });
        const agentResponse = await agentClient.createAgent(agentData);
        (0, test_1.expect)(agentResponse.success).toBe(true);
        const agentId = agentResponse.data.id;
        // Step 3: Deploy to development
        const devDeployData = {
            agentId,
            flowId,
            environment: 'development'
        };
        const devDeployResponse = await deploymentClient.deployAgent(devDeployData);
        (0, test_1.expect)(devDeployResponse.success).toBe(true);
        const devDeploymentId = devDeployResponse.data.id;
        // Step 4: Wait for development deployment to complete
        const devDeployment = await deploymentClient.waitForDeploymentCompletion(devDeploymentId, 60000);
        (0, test_1.expect)(devDeployment.status).toBe('deployed');
        // Step 5: Promote to staging
        const promoteData = {
            deploymentId: devDeploymentId,
            targetEnvironment: 'staging',
            metadata: {
                promotedBy: 'integration-test',
                promotionReason: 'testing promotion workflow'
            }
        };
        const promoteResponse = await deploymentClient.promoteDeployment(devDeploymentId, promoteData);
        (0, test_1.expect)(promoteResponse.success).toBe(true);
        (0, test_1.expect)(promoteResponse.data.environment).toBe('staging');
        // Step 6: Send a chat message to the promoted deployment
        const chatData = chatClient.createTestChatRequest('Hello, this is a test message for the promoted deployment.', flowId, agentId);
        const chatResponse = await chatClient.sendMessage(chatData);
        (0, test_1.expect)(chatResponse.success).toBe(true);
        // Step 7: Wait for response
        const response = await chatClient.waitForAblyResponse(chatResponse.data.id, 30000);
        // Validate the response
        (0, test_1.expect)(response.agentId).toBe(agentId);
        (0, test_1.expect)(response.flowId).toBe(flowId);
        (0, test_1.expect)(response.status).toBe('success');
        // Store IDs for cleanup
        testContext.flowId = flowId;
        testContext.agentId = agentId;
        testContext.deploymentIds = [devDeploymentId, promoteResponse.data.id];
    });
    (0, test_1.test)('Complete Flow: Create Flow → Create Agent → Deploy → Update Agent → Redeploy → Chat → Validate Response', async () => {
        // Step 1: Create a flow
        const flowData = data_generator_1.DataGenerator.generateFlowData({
            name: 'Update and Redeploy Test Flow',
            description: 'A flow for testing agent updates and redeployment',
            tags: ['integration', 'update', 'redeploy', 'test']
        });
        const flowResponse = await flowClient.createFlow(flowData);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        // Step 2: Create an agent
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
            name: 'Update Test Agent',
            description: 'An agent for testing updates',
            type: 'custom',
            configuration: {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000,
                systemPrompt: 'You are a helpful assistant.'
            }
        });
        const agentResponse = await agentClient.createAgent(agentData);
        (0, test_1.expect)(agentResponse.success).toBe(true);
        const agentId = agentResponse.data.id;
        // Step 3: Deploy the agent
        const deployData = {
            agentId,
            flowId,
            environment: 'development'
        };
        const deployResponse = await deploymentClient.deployAgent(deployData);
        (0, test_1.expect)(deployResponse.success).toBe(true);
        const deploymentId = deployResponse.data.id;
        // Step 4: Wait for deployment to complete
        const deployment = await deploymentClient.waitForDeploymentCompletion(deploymentId, 60000);
        (0, test_1.expect)(deployment.status).toBe('deployed');
        // Step 5: Update the agent
        const updateData = {
            name: 'Updated Test Agent',
            description: 'An updated agent for testing',
            configuration: {
                model: 'gpt-4',
                temperature: 0.5,
                maxTokens: 1500,
                systemPrompt: 'You are an updated helpful assistant with enhanced capabilities.'
            }
        };
        const updateResponse = await agentClient.updateAgent(agentId, updateData);
        (0, test_1.expect)(updateResponse.success).toBe(true);
        (0, test_1.expect)(updateResponse.data.name).toBe(updateData.name);
        // Step 6: Redeploy the updated agent
        const redeployData = {
            agentId,
            flowId,
            environment: 'development',
            version: '2.0.0'
        };
        const redeployResponse = await deploymentClient.deployAgent(redeployData);
        (0, test_1.expect)(redeployResponse.success).toBe(true);
        const redeploymentId = redeployResponse.data.id;
        // Step 7: Wait for redeployment to complete
        const redeployment = await deploymentClient.waitForDeploymentCompletion(redeploymentId, 60000);
        (0, test_1.expect)(redeployment.status).toBe('deployed');
        // Step 8: Send a chat message to the updated agent
        const chatData = chatClient.createTestChatRequest('Hello, this is a test message for the updated agent. Please respond with your enhanced capabilities.', flowId, agentId);
        const chatResponse = await chatClient.sendMessage(chatData);
        (0, test_1.expect)(chatResponse.success).toBe(true);
        // Step 9: Wait for response
        const response = await chatClient.waitForAblyResponse(chatResponse.data.id, 30000);
        // Validate the response
        (0, test_1.expect)(response.agentId).toBe(agentId);
        (0, test_1.expect)(response.flowId).toBe(flowId);
        (0, test_1.expect)(response.status).toBe('success');
        // Store IDs for cleanup
        testContext.flowId = flowId;
        testContext.agentId = agentId;
        testContext.deploymentIds = [deploymentId, redeploymentId];
    });
    test_1.test.afterEach(async () => {
        // Cleanup: Cancel deployments if they exist
        if (testContext.deploymentIds) {
            for (const deploymentId of testContext.deploymentIds) {
                try {
                    await deploymentClient.cancelDeployment(deploymentId);
                }
                catch (error) {
                    console.log(`Failed to cleanup deployment ${deploymentId}:`, error);
                }
            }
        }
        else if (testContext.deploymentId) {
            try {
                await deploymentClient.cancelDeployment(testContext.deploymentId);
            }
            catch (error) {
                console.log(`Failed to cleanup deployment ${testContext.deploymentId}:`, error);
            }
        }
        // Cleanup: Delete agents if they exist
        if (testContext.agentIds) {
            for (const agentId of testContext.agentIds) {
                try {
                    await agentClient.deleteAgent(agentId);
                }
                catch (error) {
                    console.log(`Failed to cleanup agent ${agentId}:`, error);
                }
            }
        }
        else if (testContext.agentId) {
            try {
                await agentClient.deleteAgent(testContext.agentId);
            }
            catch (error) {
                console.log(`Failed to cleanup agent ${testContext.agentId}:`, error);
            }
        }
        // Cleanup: Delete the flow if it exists
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
