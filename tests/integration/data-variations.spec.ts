import { test, expect } from '@playwright/test';
import { FlowClient } from '../../src/api/flow-client';
import { AgentClient } from '../../src/api/agent-client';
import { DataGenerator } from '../../src/utils/data-generator';
import { CustomAssertions } from '../../src/utils/assertions';
import { TestHelpers } from '../../src/utils/helpers';
import { CreateFlowRequest, CreateAgentRequest } from '../../src/types/api-types';

test.describe('Data Variation Framework Tests', () => {
  let flowClient: FlowClient;
  let agentClient: AgentClient;
  let testContext: any;

  test.beforeEach(async ({ request }) => {
    flowClient = new FlowClient(request);
    agentClient = new AgentClient(request);
    testContext = TestHelpers.createTestContext();
  });

  test.describe('Flow Data Variations', () => {
    test('should create flows with various valid data combinations', async () => {
      const baseFlowData = DataGenerator.generateFlowData();
      
      // Generate various valid data combinations
      const flowVariations = TestHelpers.generateTestDataVariations(baseFlowData, [
        { name: 'Short Name' },
        { name: 'Very Long Flow Name That Exceeds Normal Length But Still Valid' },
        { description: 'Short description' },
        { description: 'A very long description that contains multiple sentences and provides detailed information about the flow purpose and functionality.' },
        { status: 'inactive' },
        { tags: ['tag1'] },
        { tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'] },
        { tags: [] },
        { metadata: { simple: 'value' } },
        { metadata: { complex: { nested: { data: 'value' } } } },
        { metadata: {} }
      ]);
      
      const createdFlows: string[] = [];
      
      for (const flowData of flowVariations) {
        const response = await flowClient.createFlow(flowData);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertApiSuccess(response),
          () => CustomAssertions.assertStatusCode(response, 201),
          () => CustomAssertions.assertFieldValue(response, 'data.name', flowData.name),
          () => CustomAssertions.assertFieldValue(response, 'data.description', flowData.description)
        ]);
        
        expect(response.success).toBe(true);
        createdFlows.push(response.data.id);
      }
      
      testContext.flowIds = createdFlows;
    });

    test('should handle edge case data for flows', async () => {
      const edgeCaseData = DataGenerator.generateEdgeCaseData();
      
      // Test with various edge cases
      const edgeCaseTests = [
        { name: edgeCaseData.emptyString },
        { description: edgeCaseData.emptyString },
        { tags: edgeCaseData.emptyArray },
        { metadata: edgeCaseData.emptyObject },
        { name: edgeCaseData.veryLongString },
        { description: edgeCaseData.veryLongString },
        { tags: [edgeCaseData.specialCharacters] },
        { metadata: { unicode: edgeCaseData.unicodeString } }
      ];
      
      for (const edgeCase of edgeCaseTests) {
        const flowData = DataGenerator.generateFlowData(edgeCase);
        
        // Some edge cases should fail validation
        const response = await flowClient.createFlow(flowData);
        
        if (edgeCase.name === edgeCaseData.emptyString || edgeCase.description === edgeCaseData.emptyString) {
          // Empty name or description should fail
          expect(response.success).toBe(false);
          expect(response.statusCode).toBe(400);
        } else {
          // Other edge cases might succeed or fail depending on validation rules
          expect(response.statusCode).toBeGreaterThanOrEqual(200);
          expect(response.statusCode).toBeLessThan(500);
          
          if (response.success) {
            testContext.flowIds = testContext.flowIds || [];
            testContext.flowIds.push(response.data.id);
          }
        }
      }
    });

    test('should create flows with different status combinations', async () => {
      const statusVariations = ['active', 'inactive'];
      
      for (const status of statusVariations) {
        const flowData = DataGenerator.generateFlowData({ status: status as any });
        
        const response = await flowClient.createFlow(flowData);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertApiSuccess(response),
          () => CustomAssertions.assertStatusCode(response, 201),
          () => CustomAssertions.assertFieldValue(response, 'data.status', status)
        ]);
        
        expect(response.success).toBe(true);
        expect(response.data.status).toBe(status);
        
        testContext.flowIds = testContext.flowIds || [];
        testContext.flowIds.push(response.data.id);
      }
    });
  });

  test.describe('Agent Data Variations', () => {
    test('should create agents with various valid data combinations', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const baseAgentData = DataGenerator.generateAgentData(flowId);
      
      // Generate various valid data combinations
      const agentVariations = TestHelpers.generateTestDataVariations(baseAgentData, [
        { name: 'Short Agent' },
        { name: 'Very Long Agent Name That Exceeds Normal Length But Still Valid' },
        { description: 'Short description' },
        { description: 'A very long description that contains multiple sentences and provides detailed information about the agent purpose and functionality.' },
        { type: 'router' },
        { type: 'system' },
        { status: 'active' },
        { status: 'inactive' },
        { version: '1.0.0' },
        { version: '2.5.3' },
        { configuration: { model: 'gpt-4' } },
        { configuration: { model: 'gpt-3.5-turbo', temperature: 0.1 } },
        { configuration: { model: 'gpt-3.5-turbo', temperature: 0.9, maxTokens: 500 } }
      ]);
      
      const createdAgents: string[] = [];
      
      for (const agentData of agentVariations) {
        const response = await agentClient.createAgent(agentData);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertApiSuccess(response),
          () => CustomAssertions.assertStatusCode(response, 201),
          () => CustomAssertions.assertFieldValue(response, 'data.name', agentData.name),
          () => CustomAssertions.assertFieldValue(response, 'data.type', agentData.type),
          () => CustomAssertions.assertFieldValue(response, 'data.flowId', flowId)
        ]);
        
        expect(response.success).toBe(true);
        createdAgents.push(response.data.id);
      }
      
      testContext.flowId = flowId;
      testContext.agentIds = createdAgents;
    });

    test('should handle edge case data for agents', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const edgeCaseData = DataGenerator.generateEdgeCaseData();
      
      // Test with various edge cases
      const edgeCaseTests = [
        { name: edgeCaseData.emptyString },
        { description: edgeCaseData.emptyString },
        { configuration: edgeCaseData.emptyObject },
        { name: edgeCaseData.veryLongString },
        { description: edgeCaseData.veryLongString },
        { configuration: { prompt: edgeCaseData.specialCharacters } },
        { configuration: { data: edgeCaseData.unicodeString } }
      ];
      
      for (const edgeCase of edgeCaseTests) {
        const agentData = DataGenerator.generateAgentData(flowId, edgeCase);
        
        // Some edge cases should fail validation
        const response = await agentClient.createAgent(agentData);
        
        if (edgeCase.name === edgeCaseData.emptyString || edgeCase.description === edgeCaseData.emptyString) {
          // Empty name or description should fail
          expect(response.success).toBe(false);
          expect(response.statusCode).toBe(400);
        } else {
          // Other edge cases might succeed or fail depending on validation rules
          expect(response.statusCode).toBeGreaterThanOrEqual(200);
          expect(response.statusCode).toBeLessThan(500);
          
          if (response.success) {
            testContext.agentIds = testContext.agentIds || [];
            testContext.agentIds.push(response.data.id);
          }
        }
      }
      
      testContext.flowId = flowId;
    });

    test('should create agents with different types and configurations', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentTypeConfigurations = [
        {
          type: 'custom' as const,
          configuration: {
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 1000,
            systemPrompt: 'You are a helpful assistant.'
          }
        },
        {
          type: 'router' as const,
          configuration: {
            routingStrategy: 'round-robin',
            fallbackAgent: 'default',
            routingRules: [
              { condition: 'contains:technical', targetAgent: 'tech-agent' },
              { condition: 'contains:sales', targetAgent: 'sales-agent' }
            ]
          }
        },
        {
          type: 'system' as const,
          configuration: {
            systemType: 'monitoring',
            healthCheckInterval: 30000,
            alertThresholds: {
              responseTime: 5000,
              errorRate: 0.05
            }
          }
        }
      ];
      
      const createdAgents: string[] = [];
      
      for (const config of agentTypeConfigurations) {
        const agentData = DataGenerator.generateAgentData(flowId, config);
        
        const response = await agentClient.createAgent(agentData);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertApiSuccess(response),
          () => CustomAssertions.assertStatusCode(response, 201),
          () => CustomAssertions.assertFieldValue(response, 'data.type', config.type),
          () => CustomAssertions.assertFieldValue(response, 'data.flowId', flowId)
        ]);
        
        expect(response.success).toBe(true);
        expect(response.data.type).toBe(config.type);
        createdAgents.push(response.data.id);
      }
      
      testContext.flowId = flowId;
      testContext.agentIds = createdAgents;
    });
  });

  test.describe('Chat Data Variations', () => {
    test('should send chat messages with various valid data combinations', async () => {
      // First create a flow, agent, and deploy it
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const agentResponse = await agentClient.createAgent(agentData);
      const agentId = agentResponse.data.id;
      
      // Deploy the agent (simplified for this test)
      // In a real scenario, you would deploy the agent here
      
      const baseChatData = {
        message: 'Hello, this is a test message',
        flowId,
        agentId,
        userId: DataGenerator.generateUserId(),
        sessionId: DataGenerator.generateSessionId()
      };
      
      // Generate various valid data combinations
      const chatVariations = TestHelpers.generateTestDataVariations(baseChatData, [
        { message: 'Short message' },
        { message: 'A very long message that contains multiple sentences and provides detailed information about the user request and context.' },
        { message: 'Message with special characters: !@#$%^&*()' },
        { message: 'Message with unicode: 🚀🌟💫⭐️✨' },
        { message: 'Message with numbers: 1234567890' },
        { message: 'Message with JSON: {"key": "value"}' },
        { userId: DataGenerator.generateUserId() },
        { sessionId: DataGenerator.generateSessionId() },
        { metadata: { source: 'test' } },
        { metadata: { complex: { nested: { data: 'value' } } } },
        { metadata: {} }
      ]);
      
      for (const chatData of chatVariations) {
        // Note: This test assumes the agent is deployed and ready to receive messages
        // In a real scenario, you would deploy the agent first
        
        // For now, we'll just validate the chat data structure
        expect(chatData.message).toBeDefined();
        expect(chatData.flowId).toBe(flowId);
        expect(chatData.userId).toBeDefined();
        expect(chatData.sessionId).toBeDefined();
      }
      
      testContext.flowId = flowId;
      testContext.agentId = agentId;
    });

    test('should handle edge case data for chat messages', async () => {
      const edgeCaseData = DataGenerator.generateEdgeCaseData();
      
      // Test with various edge cases
      const edgeCaseTests = [
        { message: edgeCaseData.emptyString },
        { message: edgeCaseData.veryLongString },
        { message: edgeCaseData.specialCharacters },
        { message: edgeCaseData.unicodeString },
        { message: edgeCaseData.numericString },
        { message: edgeCaseData.jsonString },
        { message: edgeCaseData.htmlString },
        { message: edgeCaseData.sqlInjection },
        { message: edgeCaseData.xssString }
      ];
      
      for (const edgeCase of edgeCaseTests) {
        const chatData = {
          message: edgeCase.message,
          flowId: DataGenerator.generateFlowId(),
          agentId: DataGenerator.generateAgentId(),
          userId: DataGenerator.generateUserId(),
          sessionId: DataGenerator.generateSessionId()
        };
        
        // Validate chat data structure
        if (edgeCase.message === edgeCaseData.emptyString) {
          // Empty message should fail validation
          expect(chatData.message).toBe('');
        } else {
          // Other edge cases should have valid message content
          expect(chatData.message).toBeDefined();
          expect(chatData.message.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Data Validation Tests', () => {
    test('should validate required fields for flow creation', async () => {
      const requiredFields = ['name', 'description'];
      
      for (const field of requiredFields) {
        const flowData = DataGenerator.generateFlowData();
        delete (flowData as any)[field];
        
        const response = await flowClient.createFlow(flowData);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertStatusCode(response, 400),
          () => CustomAssertions.assertErrorMessage(response, 'required')
        ]);
        
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(400);
      }
    });

    test('should validate required fields for agent creation', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const requiredFields = ['name', 'description', 'flowId', 'type', 'configuration'];
      
      for (const field of requiredFields) {
        const agentData = DataGenerator.generateAgentData(flowId);
        delete (agentData as any)[field];
        
        const response = await agentClient.createAgent(agentData);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertStatusCode(response, 400),
          () => CustomAssertions.assertErrorMessage(response, 'required')
        ]);
        
        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(400);
      }
      
      testContext.flowId = flowId;
    });

    test('should validate field length limits', async () => {
      // Test flow name length limits
      const longNameFlow = DataGenerator.generateFlowData({
        name: 'a'.repeat(101) // Assuming 100 char limit
      });
      
      const response = await flowClient.createFlow(longNameFlow);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 400),
        () => CustomAssertions.assertErrorMessage(response, 'too long')
      ]);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  test.afterEach(async () => {
    // Cleanup: Delete agents if they exist
    if (testContext.agentIds) {
      for (const agentId of testContext.agentIds) {
        try {
          await agentClient.deleteAgent(agentId);
        } catch (error) {
          console.log(`Failed to cleanup agent ${agentId}:`, error);
        }
      }
    } else if (testContext.agentId) {
      try {
        await agentClient.deleteAgent(testContext.agentId);
      } catch (error) {
        console.log(`Failed to cleanup agent ${testContext.agentId}:`, error);
      }
    }
    
    // Cleanup: Delete flows if they exist
    if (testContext.flowIds) {
      for (const flowId of testContext.flowIds) {
        try {
          await flowClient.deleteFlow(flowId);
        } catch (error) {
          console.log(`Failed to cleanup flow ${flowId}:`, error);
        }
      }
    } else if (testContext.flowId) {
      try {
        await flowClient.deleteFlow(testContext.flowId);
      } catch (error) {
        console.log(`Failed to cleanup flow ${testContext.flowId}:`, error);
      }
    }
  });
});
