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
test_1.test.describe('Chat API and Ably Response Validation', () => {
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
    test_1.test.describe('Send Chat Message', () => {
        (0, test_1.test)('should send a chat message and receive response', async () => {
            // First create a flow, agent, and deploy it
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            // Send a chat message
            const chatData = chatClient.createTestChatRequest('Hello, this is a test message', flowId, agentId);
            const response = await chatClient.sendMessage(chatData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data.id'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.message', chatData.message),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.flowId', flowId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.userId', chatData.userId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.sessionId', chatData.sessionId),
                () => assertions_1.CustomAssertions.assertTimestampFormat(response, 'data.timestamp')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.messageId = response.data.id;
            testContext.userId = chatData.userId;
            testContext.sessionId = chatData.sessionId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.message).toBe(chatData.message);
        });
        (0, test_1.test)('should send a chat message with custom metadata', async () => {
            // First create a flow, agent, and deploy it
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            // Send a chat message with custom metadata
            const chatData = {
                message: 'Hello with custom metadata',
                flowId,
                agentId,
                userId: data_generator_1.DataGenerator.generateUserId(),
                sessionId: data_generator_1.DataGenerator.generateSessionId(),
                metadata: {
                    source: 'automation-test',
                    timestamp: data_generator_1.DataGenerator.generateTimestamp(),
                    customField: 'customValue',
                    priority: 'high'
                }
            };
            const response = await chatClient.sendMessage(chatData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.metadata.customField', 'customValue'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.metadata.priority', 'high')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.messageId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.metadata.customField).toBe('customValue');
        });
        (0, test_1.test)('should fail to send a chat message with invalid data', async () => {
            const invalidChatData = data_generator_1.DataGenerator.generateInvalidChatRequest();
            for (const invalidData of invalidChatData) {
                const response = await chatClient.sendMessage(invalidData);
                const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                    () => assertions_1.CustomAssertions.assertStatusCode(response, 400),
                    () => assertions_1.CustomAssertions.assertErrorMessage(response, 'validation error')
                ]);
                (0, test_1.expect)(response.success).toBe(false);
                (0, test_1.expect)(response.statusCode).toBe(400);
            }
        });
        (0, test_1.test)('should fail to send a chat message to non-existent flow', async () => {
            const nonExistentFlowId = data_generator_1.DataGenerator.generateFlowId();
            const chatData = chatClient.createTestChatRequest('Hello, this is a test message', nonExistentFlowId);
            const response = await chatClient.sendMessage(chatData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'flow not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Get Chat Messages', () => {
        (0, test_1.test)('should get a chat message by ID', async () => {
            // First create a flow, agent, deploy it, and send a message
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            const chatData = chatClient.createTestChatRequest('Hello, this is a test message', flowId, agentId);
            const sendResponse = await chatClient.sendMessage(chatData);
            const messageId = sendResponse.data.id;
            // Get the message
            const response = await chatClient.getMessage(messageId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.id', messageId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.message', chatData.message)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.messageId = messageId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.id).toBe(messageId);
        });
        (0, test_1.test)('should get chat messages by session ID', async () => {
            // First create a flow, agent, deploy it, and send messages
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            const sessionId = data_generator_1.DataGenerator.generateSessionId();
            const userId = data_generator_1.DataGenerator.generateUserId();
            // Send multiple messages in the same session
            const chatData1 = chatClient.createTestChatRequest('First message', flowId, agentId, userId, sessionId);
            const chatData2 = chatClient.createTestChatRequest('Second message', flowId, agentId, userId, sessionId);
            await chatClient.sendMessage(chatData1);
            await chatClient.sendMessage(chatData2);
            // Get messages by session ID
            const response = await chatClient.getMessagesBySession(sessionId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 2)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.sessionId = sessionId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.length).toBeGreaterThanOrEqual(2);
        });
        (0, test_1.test)('should get chat messages by flow ID', async () => {
            // First create a flow, agent, deploy it, and send messages
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            // Send multiple messages to the flow
            const chatData1 = chatClient.createTestChatRequest('First message', flowId, agentId);
            const chatData2 = chatClient.createTestChatRequest('Second message', flowId, agentId);
            await chatClient.sendMessage(chatData1);
            await chatClient.sendMessage(chatData2);
            // Get messages by flow ID
            const response = await chatClient.getMessagesByFlow(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 2)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.length).toBeGreaterThanOrEqual(2);
        });
        (0, test_1.test)('should get chat messages by user ID', async () => {
            // First create a flow, agent, deploy it, and send messages
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            const userId = data_generator_1.DataGenerator.generateUserId();
            // Send multiple messages from the same user
            const chatData1 = chatClient.createTestChatRequest('First message', flowId, agentId, userId);
            const chatData2 = chatClient.createTestChatRequest('Second message', flowId, agentId, userId);
            await chatClient.sendMessage(chatData1);
            await chatClient.sendMessage(chatData2);
            // Get messages by user ID
            const response = await chatClient.getMessagesByUser(userId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 2)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.userId = userId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.length).toBeGreaterThanOrEqual(2);
        });
        (0, test_1.test)('should fail to get a non-existent chat message', async () => {
            const nonExistentMessageId = data_generator_1.DataGenerator.generateUuid();
            const response = await chatClient.getMessage(nonExistentMessageId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Ably Response Validation', () => {
        (0, test_1.test)('should wait for Ably response and validate it', async () => {
            // First create a flow, agent, deploy it, and send a message
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            const chatData = chatClient.createTestChatRequest('Hello, this is a test message', flowId, agentId);
            const sendResponse = await chatClient.sendMessage(chatData);
            const messageId = sendResponse.data.id;
            // Wait for Ably response
            const response = await chatClient.waitForAblyResponse(messageId, 30000);
            const assertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId),
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId', agentId),
                () => assertions_1.CustomAssertions.assertTimestampFormat({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.timestamp')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.messageId = messageId;
            (0, test_1.expect)(response.id).toBeDefined();
            (0, test_1.expect)(response.response).toBeDefined();
            (0, test_1.expect)(response.flowId).toBe(flowId);
            (0, test_1.expect)(response.agentId).toBe(agentId);
        });
        (0, test_1.test)('should send message and wait for response in one call', async () => {
            // First create a flow, agent, deploy it
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            const chatData = chatClient.createTestChatRequest('Hello, this is a test message', flowId, agentId);
            // Send message and wait for response
            const response = await chatClient.sendMessageAndWaitForResponse(chatData, 30000);
            const assertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId),
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId', agentId)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.id).toBeDefined();
            (0, test_1.expect)(response.response).toBeDefined();
            (0, test_1.expect)(response.flowId).toBe(flowId);
            (0, test_1.expect)(response.agentId).toBe(agentId);
        });
        (0, test_1.test)('should validate chat response structure', async () => {
            // First create a flow, agent, deploy it, and send a message
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            const chatData = chatClient.createTestChatRequest('Hello, this is a test message', flowId, agentId);
            const response = await chatClient.sendMessageAndWaitForResponse(chatData, 30000);
            // Validate the response structure
            chatClient.validateChatResponse(response);
            const assertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.message'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.userId'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.sessionId'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.timestamp'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.processingTime'),
                () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.id).toBeDefined();
            (0, test_1.expect)(response.message).toBeDefined();
            (0, test_1.expect)(response.response).toBeDefined();
            (0, test_1.expect)(response.flowId).toBeDefined();
            (0, test_1.expect)(response.agentId).toBeDefined();
            (0, test_1.expect)(response.userId).toBeDefined();
            (0, test_1.expect)(response.sessionId).toBeDefined();
            (0, test_1.expect)(response.timestamp).toBeDefined();
            (0, test_1.expect)(response.processingTime).toBeDefined();
            (0, test_1.expect)(response.status).toBeDefined();
        });
    });
    test_1.test.describe('Chat Statistics', () => {
        (0, test_1.test)('should get chat statistics for a flow', async () => {
            // First create a flow, agent, deploy it, and send messages
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            // Send multiple messages
            const chatData1 = chatClient.createTestChatRequest('First message', flowId, agentId);
            const chatData2 = chatClient.createTestChatRequest('Second message', flowId, agentId);
            await chatClient.sendMessage(chatData1);
            await chatClient.sendMessage(chatData2);
            // Get chat statistics
            const response = await chatClient.getChatStats(flowId);
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
        (0, test_1.test)('should get chat statistics for an agent', async () => {
            // First create a flow, agent, deploy it, and send messages
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'development'
            };
            await deploymentClient.deployAgent(deployData);
            // Send multiple messages
            const chatData1 = chatClient.createTestChatRequest('First message', flowId, agentId);
            const chatData2 = chatClient.createTestChatRequest('Second message', flowId, agentId);
            await chatClient.sendMessage(chatData1);
            await chatClient.sendMessage(chatData2);
            // Get agent chat statistics
            const response = await chatClient.getAgentChatStats(agentId);
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
