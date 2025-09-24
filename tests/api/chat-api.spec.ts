import { test, expect } from '@playwright/test';
import { FlowClient } from '../../src/api/flow-client';
import { AgentClient } from '../../src/api/agent-client';
import { DeploymentClient } from '../../src/api/deployment-client';
import { ChatClient } from '../../src/api/chat-client';
import { DataGenerator } from '../../src/utils/data-generator';
import { CustomAssertions } from '../../src/utils/assertions';
import { TestHelpers } from '../../src/utils/helpers';
import { ChatRequest, ChatResponse, ChatMessage } from '../../src/types/api-types';

test.describe('Chat API and Ably Response Validation', () => {
  let flowClient: FlowClient;
  let agentClient: AgentClient;
  let deploymentClient: DeploymentClient;
  let chatClient: ChatClient;
  let testContext: any;

  test.beforeEach(async ({ request }) => {
    flowClient = new FlowClient(request);
    agentClient = new AgentClient(request);
    deploymentClient = new DeploymentClient(request);
    chatClient = new ChatClient(request);
    testContext = TestHelpers.createTestContext();
  });

  test.describe('Send Chat Message', () => {
    test('should send a chat message and receive response', async () => {
      // First create a flow, agent, and deploy it
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      // Send a chat message
      const chatData = chatClient.createTestChatRequest(
        'Hello, this is a test message',
        flowId,
        agentId
      );
      
      const response = await chatClient.sendMessage(chatData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldExists(response, 'data.id'),
        () => CustomAssertions.assertFieldValue(response, 'data.message', chatData.message),
        () => CustomAssertions.assertFieldValue(response, 'data.flowId', flowId),
        () => CustomAssertions.assertFieldValue(response, 'data.userId', chatData.userId),
        () => CustomAssertions.assertFieldValue(response, 'data.sessionId', chatData.sessionId),
        () => CustomAssertions.assertTimestampFormat(response, 'data.timestamp')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.messageId = response.data.id;
      testContext.userId = chatData.userId;
      testContext.sessionId = chatData.sessionId;
      
      expect(response.success).toBe(true);
      expect(response.data.message).toBe(chatData.message);
    });

    test('should send a chat message with custom metadata', async () => {
      // First create a flow, agent, and deploy it
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      // Send a chat message with custom metadata
      const chatData: ChatRequest = {
        message: 'Hello with custom metadata',
        flowId,
        agentId,
        userId: DataGenerator.generateUserId(),
        sessionId: DataGenerator.generateSessionId(),
        metadata: {
          source: 'automation-test',
          timestamp: DataGenerator.generateTimestamp(),
          customField: 'customValue',
          priority: 'high'
        }
      };
      
      const response = await chatClient.sendMessage(chatData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldValue(response, 'data.metadata.customField', 'customValue'),
        () => CustomAssertions.assertFieldValue(response, 'data.metadata.priority', 'high')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.messageId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.metadata.customField).toBe('customValue');
    });

    test('should fail to send a chat message with invalid data', async () => {
      const invalidChatData = DataGenerator.generateInvalidChatRequest();
      
      for (const invalidData of invalidChatData) {
        const response = await chatClient.sendMessage(invalidData as ChatRequest);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertStatusCode(response, 400),
          () => CustomAssertions.assertErrorMessage(response, 'validation error')
        ]);

        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(400);
      }
    });

    test('should fail to send a chat message to non-existent flow', async () => {
      const nonExistentFlowId = DataGenerator.generateFlowId();
      
      const chatData = chatClient.createTestChatRequest(
        'Hello, this is a test message',
        nonExistentFlowId
      );
      
      const response = await chatClient.sendMessage(chatData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'flow not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Get Chat Messages', () => {
    test('should get a chat message by ID', async () => {
      // First create a flow, agent, deploy it, and send a message
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      const chatData = chatClient.createTestChatRequest(
        'Hello, this is a test message',
        flowId,
        agentId
      );
      const sendResponse = await chatClient.sendMessage(chatData);
      const messageId = sendResponse.data.id;
      
      // Get the message
      const response = await chatClient.getMessage(messageId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.id', messageId),
        () => CustomAssertions.assertFieldValue(response, 'data.message', chatData.message)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.messageId = messageId;
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(messageId);
    });

    test('should get chat messages by session ID', async () => {
      // First create a flow, agent, deploy it, and send messages
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      const sessionId = DataGenerator.generateSessionId();
      const userId = DataGenerator.generateUserId();
      
      // Send multiple messages in the same session
      const chatData1 = chatClient.createTestChatRequest(
        'First message',
        flowId,
        agentId,
        userId,
        sessionId
      );
      const chatData2 = chatClient.createTestChatRequest(
        'Second message',
        flowId,
        agentId,
        userId,
        sessionId
      );
      
      await chatClient.sendMessage(chatData1);
      await chatClient.sendMessage(chatData2);
      
      // Get messages by session ID
      const response = await chatClient.getMessagesBySession(sessionId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 2)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.sessionId = sessionId;
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should get chat messages by flow ID', async () => {
      // First create a flow, agent, deploy it, and send messages
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      // Send multiple messages to the flow
      const chatData1 = chatClient.createTestChatRequest(
        'First message',
        flowId,
        agentId
      );
      const chatData2 = chatClient.createTestChatRequest(
        'Second message',
        flowId,
        agentId
      );
      
      await chatClient.sendMessage(chatData1);
      await chatClient.sendMessage(chatData2);
      
      // Get messages by flow ID
      const response = await chatClient.getMessagesByFlow(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 2)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should get chat messages by user ID', async () => {
      // First create a flow, agent, deploy it, and send messages
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      const userId = DataGenerator.generateUserId();
      
      // Send multiple messages from the same user
      const chatData1 = chatClient.createTestChatRequest(
        'First message',
        flowId,
        agentId,
        userId
      );
      const chatData2 = chatClient.createTestChatRequest(
        'Second message',
        flowId,
        agentId,
        userId
      );
      
      await chatClient.sendMessage(chatData1);
      await chatClient.sendMessage(chatData2);
      
      // Get messages by user ID
      const response = await chatClient.getMessagesByUser(userId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 2)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.userId = userId;
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should fail to get a non-existent chat message', async () => {
      const nonExistentMessageId = DataGenerator.generateUuid();
      
      const response = await chatClient.getMessage(nonExistentMessageId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Ably Response Validation', () => {
    test('should wait for Ably response and validate it', async () => {
      // First create a flow, agent, deploy it, and send a message
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      const chatData = chatClient.createTestChatRequest(
        'Hello, this is a test message',
        flowId,
        agentId
      );
      const sendResponse = await chatClient.sendMessage(chatData);
      const messageId = sendResponse.data.id;
      
      // Wait for Ably response
      const response = await chatClient.waitForAblyResponse(messageId, 30000);
      
      const assertions = CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
        () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId),
        () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId', agentId),
        () => CustomAssertions.assertTimestampFormat({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.timestamp')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.messageId = messageId;
      
      expect(response.id).toBeDefined();
      expect(response.response).toBeDefined();
      expect(response.flowId).toBe(flowId);
      expect(response.agentId).toBe(agentId);
    });

    test('should send message and wait for response in one call', async () => {
      // First create a flow, agent, deploy it
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      const chatData = chatClient.createTestChatRequest(
        'Hello, this is a test message',
        flowId,
        agentId
      );
      
      // Send message and wait for response
      const response = await chatClient.sendMessageAndWaitForResponse(chatData, 30000);
      
      const assertions = CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
        () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId),
        () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId', agentId)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.id).toBeDefined();
      expect(response.response).toBeDefined();
      expect(response.flowId).toBe(flowId);
      expect(response.agentId).toBe(agentId);
    });

    test('should validate chat response structure', async () => {
      // First create a flow, agent, deploy it, and send a message
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      const chatData = chatClient.createTestChatRequest(
        'Hello, this is a test message',
        flowId,
        agentId
      );
      const response = await chatClient.sendMessageAndWaitForResponse(chatData, 30000);
      
      // Validate the response structure
      chatClient.validateChatResponse(response);
      
      const assertions = CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.message'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.userId'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.sessionId'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.timestamp'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.processingTime'),
        () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.id).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.response).toBeDefined();
      expect(response.flowId).toBeDefined();
      expect(response.agentId).toBeDefined();
      expect(response.userId).toBeDefined();
      expect(response.sessionId).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(response.processingTime).toBeDefined();
      expect(response.status).toBeDefined();
    });
  });

  test.describe('Chat Statistics', () => {
    test('should get chat statistics for a flow', async () => {
      // First create a flow, agent, deploy it, and send messages
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      // Send multiple messages
      const chatData1 = chatClient.createTestChatRequest(
        'First message',
        flowId,
        agentId
      );
      const chatData2 = chatClient.createTestChatRequest(
        'Second message',
        flowId,
        agentId
      );
      
      await chatClient.sendMessage(chatData1);
      await chatClient.sendMessage(chatData2);
      
      // Get chat statistics
      const response = await chatClient.getChatStats(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldExists(response, 'data')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    test('should get chat statistics for an agent', async () => {
      // First create a flow, agent, deploy it, and send messages
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData = {
        agentId,
        flowId,
        environment: 'development' as const
      };
      await deploymentClient.deployAgent(deployData);
      
      // Send multiple messages
      const chatData1 = chatClient.createTestChatRequest(
        'First message',
        flowId,
        agentId
      );
      const chatData2 = chatClient.createTestChatRequest(
        'Second message',
        flowId,
        agentId
      );
      
      await chatClient.sendMessage(chatData1);
      await chatClient.sendMessage(chatData2);
      
      // Get agent chat statistics
      const response = await chatClient.getAgentChatStats(agentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldExists(response, 'data')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });
  });

  test.afterEach(async () => {
    // Cleanup: Delete the agent and flow if they were created
    if (testContext.agentId) {
      try {
        await agentClient.deleteAgent(testContext.agentId);
      } catch (error) {
        console.log(`Failed to cleanup agent ${testContext.agentId}:`, error);
      }
    }
    
    if (testContext.flowId) {
      try {
        await flowClient.deleteFlow(testContext.flowId);
      } catch (error) {
        console.log(`Failed to cleanup flow ${testContext.flowId}:`, error);
      }
    }
  });
});
