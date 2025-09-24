import { test, expect } from '@playwright/test';
import { FlowClient } from '../../src/api/flow-client';
import { AgentClient } from '../../src/api/agent-client';
import { DeploymentClient } from '../../src/api/deployment-client';
import { ChatClient } from '../../src/api/chat-client';
import { DataGenerator } from '../../src/utils/data-generator';
import { CustomAssertions } from '../../src/utils/assertions';
import { TestHelpers } from '../../src/utils/helpers';

/**
 * Example Test: Complete Agent Creation Flow
 * 
 * This test demonstrates the complete workflow for creating an agent:
 * 1. Create a Flow
 * 2. Create an Agent within the Flow
 * 3. Deploy the Agent
 * 4. Send a Chat Message
 * 5. Validate the Response via Ably
 * 6. Clean up resources
 */
test.describe('Example: Complete Agent Creation Flow', () => {
  let flowClient: FlowClient;
  let agentClient: AgentClient;
  let deploymentClient: DeploymentClient;
  let chatClient: ChatClient;
  let testContext: any;

  test.beforeEach(async ({ request }) => {
    // Initialize API clients
    flowClient = new FlowClient(request);
    agentClient = new AgentClient(request);
    deploymentClient = new DeploymentClient(request);
    chatClient = new ChatClient(request);
    testContext = TestHelpers.createTestContext();
  });

  test('Complete Agent Creation and Chat Flow', async () => {
    console.log('🚀 Starting Complete Agent Creation Flow Test');
    
    // Step 1: Create a Flow
    console.log('📝 Step 1: Creating a Flow');
    const flowData = DataGenerator.generateFlowData({
      name: 'Example Test Flow',
      description: 'A flow for demonstrating the complete agent creation process',
      tags: ['example', 'test', 'automation'],
      metadata: {
        createdBy: 'example-test',
        environment: 'test',
        purpose: 'demonstration'
      }
    });
    
    const flowResponse = await flowClient.createFlow(flowData);
    
    // Validate flow creation
    const flowAssertions = CustomAssertions.runAssertions(flowResponse, [
      () => CustomAssertions.assertApiSuccess(flowResponse),
      () => CustomAssertions.assertStatusCode(flowResponse, 201),
      () => CustomAssertions.assertFieldExists(flowResponse, 'data.id'),
      () => CustomAssertions.assertFieldValue(flowResponse, 'data.name', flowData.name),
      () => CustomAssertions.assertFieldValue(flowResponse, 'data.description', flowData.description),
      () => CustomAssertions.assertTimestampFormat(flowResponse, 'data.createdAt')
    ]);
    
    expect(flowResponse.success).toBe(true);
    const flowId = flowResponse.data.id;
    console.log(`✅ Flow created successfully with ID: ${flowId}`);
    
    // Step 2: Create an Agent within the Flow
    console.log('🤖 Step 2: Creating an Agent within the Flow');
    const agentData = DataGenerator.generateAgentData(flowId, {
      name: 'Example Test Agent',
      description: 'An agent for demonstrating the complete creation process',
      type: 'custom',
      configuration: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: 'You are a helpful assistant for testing purposes. Please respond politely and helpfully to user messages.'
      },
      status: 'draft'
    });
    
    const agentResponse = await agentClient.createAgent(agentData);
    
    // Validate agent creation
    const agentAssertions = CustomAssertions.runAssertions(agentResponse, [
      () => CustomAssertions.assertApiSuccess(agentResponse),
      () => CustomAssertions.assertStatusCode(agentResponse, 201),
      () => CustomAssertions.assertFieldExists(agentResponse, 'data.id'),
      () => CustomAssertions.assertFieldValue(agentResponse, 'data.name', agentData.name),
      () => CustomAssertions.assertFieldValue(agentResponse, 'data.type', agentData.type),
      () => CustomAssertions.assertFieldValue(agentResponse, 'data.flowId', flowId),
      () => CustomAssertions.assertFieldValue(agentResponse, 'data.status', agentData.status)
    ]);
    
    expect(agentResponse.success).toBe(true);
    const agentId = agentResponse.data.id;
    console.log(`✅ Agent created successfully with ID: ${agentId}`);
    
    // Step 3: Deploy the Agent
    console.log('🚀 Step 3: Deploying the Agent');
    const deployData = {
      agentId,
      flowId,
      environment: 'development' as const,
      metadata: {
        deployedBy: 'example-test',
        version: '1.0.0',
        environment: 'test'
      }
    };
    
    const deployResponse = await deploymentClient.deployAgent(deployData);
    
    // Validate deployment creation
    const deployAssertions = CustomAssertions.runAssertions(deployResponse, [
      () => CustomAssertions.assertApiSuccess(deployResponse),
      () => CustomAssertions.assertStatusCode(deployResponse, 201),
      () => CustomAssertions.assertFieldExists(deployResponse, 'data.id'),
      () => CustomAssertions.assertFieldValue(deployResponse, 'data.agentId', agentId),
      () => CustomAssertions.assertFieldValue(deployResponse, 'data.flowId', flowId),
      () => CustomAssertions.assertFieldValue(deployResponse, 'data.environment', 'development'),
      () => CustomAssertions.assertFieldValue(deployResponse, 'data.status', 'pending')
    ]);
    
    expect(deployResponse.success).toBe(true);
    const deploymentId = deployResponse.data.id;
    console.log(`✅ Deployment initiated successfully with ID: ${deploymentId}`);
    
    // Step 4: Wait for Deployment to Complete
    console.log('⏳ Step 4: Waiting for Deployment to Complete');
    const deployment = await deploymentClient.waitForDeploymentCompletion(deploymentId, 60000);
    
    // Validate deployment completion
    const deploymentCompleteAssertions = CustomAssertions.runAssertions({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, [
      () => CustomAssertions.assertFieldValue({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'deployed')
    ]);
    
    expect(deployment.status).toBe('deployed');
    console.log(`✅ Deployment completed successfully with status: ${deployment.status}`);
    
    // Step 5: Send a Chat Message
    console.log('💬 Step 5: Sending a Chat Message');
    const chatData = chatClient.createTestChatRequest(
      'Hello! This is a test message for the example agent. Please respond with a friendly greeting.',
      flowId,
      agentId,
      DataGenerator.generateUserId(),
      DataGenerator.generateSessionId()
    );
    
    const chatResponse = await chatClient.sendMessage(chatData);
    
    // Validate chat message creation
    const chatAssertions = CustomAssertions.runAssertions(chatResponse, [
      () => CustomAssertions.assertApiSuccess(chatResponse),
      () => CustomAssertions.assertStatusCode(chatResponse, 201),
      () => CustomAssertions.assertFieldExists(chatResponse, 'data.id'),
      () => CustomAssertions.assertFieldValue(chatResponse, 'data.message', chatData.message),
      () => CustomAssertions.assertFieldValue(chatResponse, 'data.flowId', flowId),
      () => CustomAssertions.assertFieldValue(chatResponse, 'data.userId', chatData.userId),
      () => CustomAssertions.assertFieldValue(chatResponse, 'data.sessionId', chatData.sessionId),
      () => CustomAssertions.assertTimestampFormat(chatResponse, 'data.timestamp')
    ]);
    
    expect(chatResponse.success).toBe(true);
    const messageId = chatResponse.data.id;
    console.log(`✅ Chat message sent successfully with ID: ${messageId}`);
    
    // Step 6: Wait for Ably Response and Validate
    console.log('📡 Step 6: Waiting for Ably Response');
    const response = await chatClient.waitForAblyResponse(messageId, 30000);
    
    // Validate the complete response
    const responseAssertions = CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
      () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
      () => CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
      () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId),
      () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId', agentId),
      () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.userId', chatData.userId),
      () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.sessionId', chatData.sessionId),
      () => CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'success'),
      () => CustomAssertions.assertTimestampFormat({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.timestamp'),
      () => CustomAssertions.assertFieldType({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.processingTime', 'number')
    ]);
    
    // Log test result
    const testResult = TestHelpers.generateTestResult(
      'Complete Agent Creation Flow',
      [...flowAssertions, ...agentAssertions, ...deployAssertions, ...deploymentCompleteAssertions, ...chatAssertions, ...responseAssertions],
      Date.now()
    );
    TestHelpers.logTestResult(testResult);
    
    // Final validations
    expect(response.id).toBeDefined();
    expect(response.response).toBeDefined();
    expect(response.flowId).toBe(flowId);
    expect(response.agentId).toBe(agentId);
    expect(response.userId).toBe(chatData.userId);
    expect(response.sessionId).toBe(chatData.sessionId);
    expect(response.status).toBe('success');
    expect(response.processingTime).toBeGreaterThan(0);
    
    console.log(`✅ Ably response received successfully`);
    console.log(`📊 Response Summary:`);
    console.log(`   - Response ID: ${response.id}`);
    console.log(`   - Flow ID: ${response.flowId}`);
    console.log(`   - Agent ID: ${response.agentId}`);
    console.log(`   - Processing Time: ${response.processingTime}ms`);
    console.log(`   - Status: ${response.status}`);
    
    // Store IDs for cleanup
    testContext.flowId = flowId;
    testContext.agentId = agentId;
    testContext.deploymentId = deploymentId;
    
    console.log('🎉 Complete Agent Creation Flow Test completed successfully!');
  });

  test.afterEach(async () => {
    console.log('🧹 Cleaning up test resources...');
    
    // Cleanup: Cancel deployment if it exists
    if (testContext.deploymentId) {
      try {
        await deploymentClient.cancelDeployment(testContext.deploymentId);
        console.log(`✅ Deployment ${testContext.deploymentId} cancelled`);
      } catch (error) {
        console.log(`⚠️  Failed to cleanup deployment ${testContext.deploymentId}:`, error);
      }
    }
    
    // Cleanup: Delete the agent if it exists
    if (testContext.agentId) {
      try {
        await agentClient.deleteAgent(testContext.agentId);
        console.log(`✅ Agent ${testContext.agentId} deleted`);
      } catch (error) {
        console.log(`⚠️  Failed to cleanup agent ${testContext.agentId}:`, error);
      }
    }
    
    // Cleanup: Delete the flow if it exists
    if (testContext.flowId) {
      try {
        await flowClient.deleteFlow(testContext.flowId);
        console.log(`✅ Flow ${testContext.flowId} deleted`);
      } catch (error) {
        console.log(`⚠️  Failed to cleanup flow ${testContext.flowId}:`, error);
      }
    }
    
    console.log('✅ Cleanup completed');
  });
});
