import { test, expect } from '@playwright/test';
import { FlowClient } from '../../src/api/flow-client';
import { AgentClient } from '../../src/api/agent-client';
import { DataGenerator } from '../../src/utils/data-generator';
import { CustomAssertions } from '../../src/utils/assertions';
import { TestHelpers } from '../../src/utils/helpers';
import { CreateFlowRequest, CreateAgentRequest, Agent } from '../../src/types/api-types';

test.describe('Agent CRUD Operations', () => {
  let flowClient: FlowClient;
  let agentClient: AgentClient;
  let testContext: any;

  test.beforeEach(async ({ request }) => {
    flowClient = new FlowClient(request);
    agentClient = new AgentClient(request);
    testContext = TestHelpers.createTestContext();
  });

  test.describe('Create Agent', () => {
    test('should create a custom agent with valid data', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      // Then create an agent in the flow
      const agentData = DataGenerator.generateAgentData(flowId);
      
      const response = await agentClient.createAgent(agentData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldExists(response, 'data.id'),
        () => CustomAssertions.assertFieldValue(response, 'data.name', agentData.name),
        () => CustomAssertions.assertFieldValue(response, 'data.description', agentData.description),
        () => CustomAssertions.assertFieldValue(response, 'data.type', agentData.type),
        () => CustomAssertions.assertFieldValue(response, 'data.flowId', flowId),
        () => CustomAssertions.assertFieldValue(response, 'data.status', agentData.status),
        () => CustomAssertions.assertTimestampFormat(response, 'data.createdAt'),
        () => CustomAssertions.assertTimestampFormat(response, 'data.updatedAt')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.name).toBe(agentData.name);
      expect(response.data.flowId).toBe(flowId);
    });

    test('should create a router agent with valid data', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      // Create a router agent
      const agentData = DataGenerator.generateAgentData(flowId, {
        type: 'router',
        configuration: {
          routingStrategy: 'round-robin',
          fallbackAgent: 'default'
        }
      });
      
      const response = await agentClient.createAgent(agentData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldValue(response, 'data.type', 'router'),
        () => CustomAssertions.assertFieldValue(response, 'data.configuration.routingStrategy', 'round-robin')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.type).toBe('router');
    });

    test('should create a system agent with valid data', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      // Create a system agent
      const agentData = DataGenerator.generateAgentData(flowId, {
        type: 'system',
        configuration: {
          systemType: 'monitoring',
          healthCheckInterval: 30000
        }
      });
      
      const response = await agentClient.createAgent(agentData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldValue(response, 'data.type', 'system'),
        () => CustomAssertions.assertFieldValue(response, 'data.configuration.systemType', 'monitoring')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.type).toBe('system');
    });

    test('should fail to create an agent with invalid data', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const invalidAgentData = DataGenerator.generateInvalidAgentData();
      
      for (const invalidData of invalidAgentData) {
        const response = await agentClient.createAgent({
          ...invalidData,
          flowId
        } as CreateAgentRequest);
        
        const assertions = CustomAssertions.runAssertions(response, [
          () => CustomAssertions.assertStatusCode(response, 400),
          () => CustomAssertions.assertErrorMessage(response, 'validation error')
        ]);

        expect(response.success).toBe(false);
        expect(response.statusCode).toBe(400);
      }
      
      testContext.flowId = flowId;
    });

    test('should fail to create an agent in a non-existent flow', async () => {
      const nonExistentFlowId = DataGenerator.generateFlowId();
      const agentData = DataGenerator.generateAgentData(nonExistentFlowId);
      
      const response = await agentClient.createAgent(agentData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'flow not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Get Agent', () => {
    test('should get an agent by ID', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Then get the agent
      const response = await agentClient.getAgent(agentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.id', agentId),
        () => CustomAssertions.assertFieldValue(response, 'data.name', agentData.name)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(agentId);
    });

    test('should get agents by flow ID', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      // Create multiple agents in the flow
      const agent1Data = DataGenerator.generateAgentData(flowId);
      const agent2Data = DataGenerator.generateAgentData(flowId);
      
      await agentClient.createAgent(agent1Data);
      await agentClient.createAgent(agent2Data);
      
      // Get agents by flow ID
      const response = await agentClient.getAgentsByFlowId(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 2) // Should have at least 2 agents
      ]);

      testContext.flowId = flowId;
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should get agents by type', async () => {
      const response = await agentClient.getAgentsByType('custom');
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 0)
      ]);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('should get agents by status', async () => {
      const response = await agentClient.getAgentsByStatus('active');
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 0)
      ]);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('should search agents by name', async () => {
      const response = await agentClient.searchAgents('test');
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 0)
      ]);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('should fail to get a non-existent agent', async () => {
      const nonExistentAgentId = DataGenerator.generateAgentId();
      
      const response = await agentClient.getAgent(nonExistentAgentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Update Agent', () => {
    test('should update an agent with valid data', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Then update the agent
      const updateData = {
        name: 'Updated Agent Name',
        description: 'Updated Agent Description',
        status: 'active' as const,
        configuration: {
          model: 'gpt-4',
          temperature: 0.5,
          maxTokens: 2000
        }
      };
      
      const response = await agentClient.updateAgent(agentId, updateData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.id', agentId),
        () => CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
        () => CustomAssertions.assertFieldValue(response, 'data.description', updateData.description),
        () => CustomAssertions.assertFieldValue(response, 'data.status', updateData.status)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data.name).toBe(updateData.name);
    });

    test('should partially update an agent', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Then partially update the agent
      const updateData = {
        name: 'Partially Updated Agent Name'
      };
      
      const response = await agentClient.patchAgent(agentId, updateData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.name', updateData.name),
        () => CustomAssertions.assertFieldValue(response, 'data.description', agentData.description) // Should remain unchanged
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data.name).toBe(updateData.name);
      expect(response.data.description).toBe(agentData.description);
    });

    test('should fail to update a non-existent agent', async () => {
      const nonExistentAgentId = DataGenerator.generateAgentId();
      const updateData = {
        name: 'Updated Agent Name'
      };
      
      const response = await agentClient.updateAgent(nonExistentAgentId, updateData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Delete Agent', () => {
    test('should delete an agent successfully', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Then delete the agent
      const response = await agentClient.deleteAgent(agentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200)
      ]);

      testContext.flowId = flowId;
      
      expect(response.success).toBe(true);
    });

    test('should fail to delete a non-existent agent', async () => {
      const nonExistentAgentId = DataGenerator.generateAgentId();
      
      const response = await agentClient.deleteAgent(nonExistentAgentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });

    test('should verify agent is deleted by trying to get it', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Delete the agent
      await agentClient.deleteAgent(agentId);
      
      // Try to get the deleted agent
      const response = await agentClient.getAgent(agentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      testContext.flowId = flowId;
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Router Agent', () => {
    test('should get router agent for a flow', async () => {
      // First create a flow
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      // Wait for router agent to be created (this happens automatically when a flow is created)
      const routerAgent = await agentClient.waitForRouterAgentCreation(flowId);
      
      const assertions = CustomAssertions.runAssertions({ success: true, data: routerAgent, statusCode: 200, timestamp: new Date().toISOString() }, [
        () => CustomAssertions.assertFieldValue({ success: true, data: routerAgent, statusCode: 200, timestamp: new Date().toISOString() }, 'data.type', 'router'),
        () => CustomAssertions.assertFieldValue({ success: true, data: routerAgent, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = routerAgent.id;
      
      expect(routerAgent.type).toBe('router');
      expect(routerAgent.flowId).toBe(flowId);
    });

    test('should fail to get router agent for non-existent flow', async () => {
      const nonExistentFlowId = DataGenerator.generateFlowId();
      
      const response = await agentClient.getRouterAgent(nonExistentFlowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Agent Statistics', () => {
    test('should get agent statistics', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Get agent statistics
      const response = await agentClient.getAgentStats(agentId);
      
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
