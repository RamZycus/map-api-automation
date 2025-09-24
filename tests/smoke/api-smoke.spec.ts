import { test, expect } from '@playwright/test';
import { FlowClient } from '../../src/api/flow-client';
import { AgentClient } from '../../src/api/agent-client';
import { DeploymentClient } from '../../src/api/deployment-client';
import { ChatClient } from '../../src/api/chat-client';
import { DataGenerator } from '../../src/utils/data-generator';
import { CustomAssertions } from '../../src/utils/assertions';
import { TestHelpers } from '../../src/utils/helpers';

test.describe('Smoke Tests - Basic API Functionality', () => {
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

  test('Smoke Test: API Health Check', async () => {
    // Test basic API connectivity by creating a simple flow
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow',
      description: 'A flow for smoke testing'
    });
    
    const response = await flowClient.createFlow(flowData);
    
    const assertions = CustomAssertions.runAssertions(response, [
      () => CustomAssertions.assertApiSuccess(response),
      () => CustomAssertions.assertStatusCode(response, 201),
      () => CustomAssertions.assertFieldExists(response, 'data.id')
    ]);
    
    testContext.flowId = response.data.id;
    
    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
  });

  test('Smoke Test: Flow CRUD Operations', async () => {
    // Create
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow CRUD',
      description: 'A flow for testing CRUD operations'
    });
    
    const createResponse = await flowClient.createFlow(flowData);
    expect(createResponse.success).toBe(true);
    const flowId = createResponse.data.id;
    
    // Read
    const getResponse = await flowClient.getFlow(flowId);
    expect(getResponse.success).toBe(true);
    expect(getResponse.data.id).toBe(flowId);
    
    // Update
    const updateData = {
      name: 'Updated Smoke Test Flow',
      description: 'An updated flow for testing CRUD operations'
    };
    
    const updateResponse = await flowClient.updateFlow(flowId, updateData);
    expect(updateResponse.success).toBe(true);
    expect(updateResponse.data.name).toBe(updateData.name);
    
    // Delete
    const deleteResponse = await flowClient.deleteFlow(flowId);
    expect(deleteResponse.success).toBe(true);
    
    // Verify deletion
    const getDeletedResponse = await flowClient.getFlow(flowId);
    expect(getDeletedResponse.success).toBe(false);
    expect(getDeletedResponse.statusCode).toBe(404);
  });

  test('Smoke Test: Agent CRUD Operations', async () => {
    // Create a flow first
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow for Agent',
      description: 'A flow for testing agent CRUD operations'
    });
    
    const flowResponse = await flowClient.createFlow(flowData);
    expect(flowResponse.success).toBe(true);
    const flowId = flowResponse.data.id;
    
    // Create
    const agentData = DataGenerator.generateAgentData(flowId, {
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
    expect(createResponse.success).toBe(true);
    const agentId = createResponse.data.id;
    
    // Read
    const getResponse = await agentClient.getAgent(agentId);
    expect(getResponse.success).toBe(true);
    expect(getResponse.data.id).toBe(agentId);
    
    // Update
    const updateData = {
      name: 'Updated Smoke Test Agent',
      description: 'An updated agent for testing CRUD operations'
    };
    
    const updateResponse = await agentClient.updateAgent(agentId, updateData);
    expect(updateResponse.success).toBe(true);
    expect(updateResponse.data.name).toBe(updateData.name);
    
    // Delete
    const deleteResponse = await agentClient.deleteAgent(agentId);
    expect(deleteResponse.success).toBe(true);
    
    // Verify deletion
    const getDeletedResponse = await agentClient.getAgent(agentId);
    expect(getDeletedResponse.success).toBe(false);
    expect(getDeletedResponse.statusCode).toBe(404);
    
    // Cleanup flow
    await flowClient.deleteFlow(flowId);
  });

  test('Smoke Test: Deployment Operations', async () => {
    // Create a flow and agent first
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow for Deployment',
      description: 'A flow for testing deployment operations'
    });
    
    const flowResponse = await flowClient.createFlow(flowData);
    expect(flowResponse.success).toBe(true);
    const flowId = flowResponse.data.id;
    
    const agentData = DataGenerator.generateAgentData(flowId, {
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
    expect(agentResponse.success).toBe(true);
    const agentId = agentResponse.data.id;
    
    // Deploy
    const deployData = {
      agentId,
      flowId,
      environment: 'development' as const
    };
    
    const deployResponse = await deploymentClient.deployAgent(deployData);
    expect(deployResponse.success).toBe(true);
    const deploymentId = deployResponse.data.id;
    
    // Get deployment
    const getDeploymentResponse = await deploymentClient.getDeployment(deploymentId);
    expect(getDeploymentResponse.success).toBe(true);
    expect(getDeploymentResponse.data.id).toBe(deploymentId);
    
    // Cancel deployment
    const cancelResponse = await deploymentClient.cancelDeployment(deploymentId);
    expect(cancelResponse.success).toBe(true);
    
    // Cleanup
    await agentClient.deleteAgent(agentId);
    await flowClient.deleteFlow(flowId);
  });

  test('Smoke Test: Chat API Operations', async () => {
    // Create a flow and agent first
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow for Chat',
      description: 'A flow for testing chat operations'
    });
    
    const flowResponse = await flowClient.createFlow(flowData);
    expect(flowResponse.success).toBe(true);
    const flowId = flowResponse.data.id;
    
    const agentData = DataGenerator.generateAgentData(flowId, {
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
    expect(agentResponse.success).toBe(true);
    const agentId = agentResponse.data.id;
    
    // Deploy the agent
    const deployData = {
      agentId,
      flowId,
      environment: 'development' as const
    };
    
    const deployResponse = await deploymentClient.deployAgent(deployData);
    expect(deployResponse.success).toBe(true);
    
    // Wait for deployment to complete
    const deployment = await deploymentClient.waitForDeploymentCompletion(deployResponse.data.id, 60000);
    expect(deployment.status).toBe('deployed');
    
    // Send a chat message
    const chatData = chatClient.createTestChatRequest(
      'Hello, this is a smoke test message',
      flowId,
      agentId
    );
    
    const chatResponse = await chatClient.sendMessage(chatData);
    expect(chatResponse.success).toBe(true);
    const messageId = chatResponse.data.id;
    
    // Get the message
    const getMessageResponse = await chatClient.getMessage(messageId);
    expect(getMessageResponse.success).toBe(true);
    expect(getMessageResponse.data.id).toBe(messageId);
    
    // Cleanup
    await deploymentClient.cancelDeployment(deployResponse.data.id);
    await agentClient.deleteAgent(agentId);
    await flowClient.deleteFlow(flowId);
  });

  test('Smoke Test: Error Handling', async () => {
    // Test 404 error
    const nonExistentFlowId = DataGenerator.generateFlowId();
    const getResponse = await flowClient.getFlow(nonExistentFlowId);
    expect(getResponse.success).toBe(false);
    expect(getResponse.statusCode).toBe(404);
    
    // Test 400 error with invalid data
    const invalidFlowData = {
      name: '', // Empty name should fail
      description: 'Invalid flow data'
    };
    
    const createResponse = await flowClient.createFlow(invalidFlowData as any);
    expect(createResponse.success).toBe(false);
    expect(createResponse.statusCode).toBe(400);
  });

  test('Smoke Test: Data Validation', async () => {
    // Test required field validation
    const flowData = DataGenerator.generateFlowData();
    delete (flowData as any).name; // Remove required field
    
    const response = await flowClient.createFlow(flowData);
    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(400);
  });

  test('Smoke Test: Pagination', async () => {
    // Test pagination for flows
    const response = await flowClient.getFlows(1, 5);
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.pagination.page).toBe(1);
    expect(response.pagination.limit).toBe(5);
  });

  test('Smoke Test: Search Functionality', async () => {
    // Test search for flows
    const response = await flowClient.searchFlows('test');
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('Smoke Test: Statistics Endpoints', async () => {
    // Create a flow for testing statistics
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow for Statistics',
      description: 'A flow for testing statistics endpoints'
    });
    
    const flowResponse = await flowClient.createFlow(flowData);
    expect(flowResponse.success).toBe(true);
    const flowId = flowResponse.data.id;
    
    // Test flow statistics
    const statsResponse = await flowClient.getFlowStats(flowId);
    expect(statsResponse.success).toBe(true);
    expect(statsResponse.data).toBeDefined();
    
    // Cleanup
    await flowClient.deleteFlow(flowId);
  });

  test('Smoke Test: Router Agent Creation', async () => {
    // Create a flow
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow for Router Agent',
      description: 'A flow for testing router agent creation'
    });
    
    const flowResponse = await flowClient.createFlow(flowData);
    expect(flowResponse.success).toBe(true);
    const flowId = flowResponse.data.id;
    
    // Wait for router agent to be created
    const routerAgent = await agentClient.waitForRouterAgentCreation(flowId, 30000);
    expect(routerAgent.type).toBe('router');
    expect(routerAgent.flowId).toBe(flowId);
    
    // Cleanup
    await flowClient.deleteFlow(flowId);
  });

  test('Smoke Test: Multiple Environment Deployment', async () => {
    // Create a flow and agent
    const flowData = DataGenerator.generateFlowData({
      name: 'Smoke Test Flow for Multi-Env',
      description: 'A flow for testing multiple environment deployments'
    });
    
    const flowResponse = await flowClient.createFlow(flowData);
    expect(flowResponse.success).toBe(true);
    const flowId = flowResponse.data.id;
    
    const agentData = DataGenerator.generateAgentData(flowId, {
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
    expect(agentResponse.success).toBe(true);
    const agentId = agentResponse.data.id;
    
    // Deploy to different environments
    const environments = ['development', 'staging', 'production'];
    const deploymentIds: string[] = [];
    
    for (const environment of environments) {
      const deployData = {
        agentId,
        flowId,
        environment: environment as any
      };
      
      const deployResponse = await deploymentClient.deployAgent(deployData);
      expect(deployResponse.success).toBe(true);
      expect(deployResponse.data.environment).toBe(environment);
      deploymentIds.push(deployResponse.data.id);
    }
    
    // Cleanup
    for (const deploymentId of deploymentIds) {
      await deploymentClient.cancelDeployment(deploymentId);
    }
    await agentClient.deleteAgent(agentId);
    await flowClient.deleteFlow(flowId);
  });

  test.afterEach(async () => {
    // Cleanup any remaining test data
    if (testContext.flowId) {
      try {
        await flowClient.deleteFlow(testContext.flowId);
      } catch (error) {
        console.log(`Failed to cleanup flow ${testContext.flowId}:`, error);
      }
    }
  });
});
