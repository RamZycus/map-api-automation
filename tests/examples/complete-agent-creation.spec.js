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
test_1.test.describe('Example: Complete Agent Creation Flow', () => {
    let flowClient;
    let agentClient;
    let deploymentClient;
    let chatClient;
    let testContext;
    test_1.test.beforeEach(async ({ request }) => {
        // Initialize API clients
        flowClient = new flow_client_1.FlowClient(request);
        agentClient = new agent_client_1.AgentClient(request);
        deploymentClient = new deployment_client_1.DeploymentClient(request);
        chatClient = new chat_client_1.ChatClient(request);
        testContext = helpers_1.TestHelpers.createTestContext();
    });
    (0, test_1.test)('Complete Agent Creation and Chat Flow', async () => {
        console.log('🚀 Starting Complete Agent Creation Flow Test');
        // Step 1: Create a Flow
        console.log('📝 Step 1: Creating a Flow');
        const flowData = data_generator_1.DataGenerator.generateFlowData({
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
        const flowAssertions = assertions_1.CustomAssertions.runAssertions(flowResponse, [
            () => assertions_1.CustomAssertions.assertApiSuccess(flowResponse),
            () => assertions_1.CustomAssertions.assertStatusCode(flowResponse, 201),
            () => assertions_1.CustomAssertions.assertFieldExists(flowResponse, 'data.id'),
            () => assertions_1.CustomAssertions.assertFieldValue(flowResponse, 'data.name', flowData.name),
            () => assertions_1.CustomAssertions.assertFieldValue(flowResponse, 'data.description', flowData.description),
            () => assertions_1.CustomAssertions.assertTimestampFormat(flowResponse, 'data.createdAt')
        ]);
        (0, test_1.expect)(flowResponse.success).toBe(true);
        const flowId = flowResponse.data.id;
        console.log(`✅ Flow created successfully with ID: ${flowId}`);
        // Step 2: Create an Agent within the Flow
        console.log('🤖 Step 2: Creating an Agent within the Flow');
        const agentData = data_generator_1.DataGenerator.generateAgentData(flowId, {
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
        const agentAssertions = assertions_1.CustomAssertions.runAssertions(agentResponse, [
            () => assertions_1.CustomAssertions.assertApiSuccess(agentResponse),
            () => assertions_1.CustomAssertions.assertStatusCode(agentResponse, 201),
            () => assertions_1.CustomAssertions.assertFieldExists(agentResponse, 'data.id'),
            () => assertions_1.CustomAssertions.assertFieldValue(agentResponse, 'data.name', agentData.name),
            () => assertions_1.CustomAssertions.assertFieldValue(agentResponse, 'data.type', agentData.type),
            () => assertions_1.CustomAssertions.assertFieldValue(agentResponse, 'data.flowId', flowId),
            () => assertions_1.CustomAssertions.assertFieldValue(agentResponse, 'data.status', agentData.status)
        ]);
        (0, test_1.expect)(agentResponse.success).toBe(true);
        const agentId = agentResponse.data.id;
        console.log(`✅ Agent created successfully with ID: ${agentId}`);
        // Step 3: Deploy the Agent
        console.log('🚀 Step 3: Deploying the Agent');
        const deployData = {
            agentId,
            flowId,
            environment: 'development',
            metadata: {
                deployedBy: 'example-test',
                version: '1.0.0',
                environment: 'test'
            }
        };
        const deployResponse = await deploymentClient.deployAgent(deployData);
        // Validate deployment creation
        const deployAssertions = assertions_1.CustomAssertions.runAssertions(deployResponse, [
            () => assertions_1.CustomAssertions.assertApiSuccess(deployResponse),
            () => assertions_1.CustomAssertions.assertStatusCode(deployResponse, 201),
            () => assertions_1.CustomAssertions.assertFieldExists(deployResponse, 'data.id'),
            () => assertions_1.CustomAssertions.assertFieldValue(deployResponse, 'data.agentId', agentId),
            () => assertions_1.CustomAssertions.assertFieldValue(deployResponse, 'data.flowId', flowId),
            () => assertions_1.CustomAssertions.assertFieldValue(deployResponse, 'data.environment', 'development'),
            () => assertions_1.CustomAssertions.assertFieldValue(deployResponse, 'data.status', 'pending')
        ]);
        (0, test_1.expect)(deployResponse.success).toBe(true);
        const deploymentId = deployResponse.data.id;
        console.log(`✅ Deployment initiated successfully with ID: ${deploymentId}`);
        // Step 4: Wait for Deployment to Complete
        console.log('⏳ Step 4: Waiting for Deployment to Complete');
        const deployment = await deploymentClient.waitForDeploymentCompletion(deploymentId, 60000);
        // Validate deployment completion
        const deploymentCompleteAssertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, [
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'deployed')
        ]);
        (0, test_1.expect)(deployment.status).toBe('deployed');
        console.log(`✅ Deployment completed successfully with status: ${deployment.status}`);
        // Step 5: Send a Chat Message
        console.log('💬 Step 5: Sending a Chat Message');
        const chatData = chatClient.createTestChatRequest('Hello! This is a test message for the example agent. Please respond with a friendly greeting.', flowId, agentId, data_generator_1.DataGenerator.generateUserId(), data_generator_1.DataGenerator.generateSessionId());
        const chatResponse = await chatClient.sendMessage(chatData);
        // Validate chat message creation
        const chatAssertions = assertions_1.CustomAssertions.runAssertions(chatResponse, [
            () => assertions_1.CustomAssertions.assertApiSuccess(chatResponse),
            () => assertions_1.CustomAssertions.assertStatusCode(chatResponse, 201),
            () => assertions_1.CustomAssertions.assertFieldExists(chatResponse, 'data.id'),
            () => assertions_1.CustomAssertions.assertFieldValue(chatResponse, 'data.message', chatData.message),
            () => assertions_1.CustomAssertions.assertFieldValue(chatResponse, 'data.flowId', flowId),
            () => assertions_1.CustomAssertions.assertFieldValue(chatResponse, 'data.userId', chatData.userId),
            () => assertions_1.CustomAssertions.assertFieldValue(chatResponse, 'data.sessionId', chatData.sessionId),
            () => assertions_1.CustomAssertions.assertTimestampFormat(chatResponse, 'data.timestamp')
        ]);
        (0, test_1.expect)(chatResponse.success).toBe(true);
        const messageId = chatResponse.data.id;
        console.log(`✅ Chat message sent successfully with ID: ${messageId}`);
        // Step 6: Wait for Ably Response and Validate
        console.log('📡 Step 6: Waiting for Ably Response');
        const response = await chatClient.waitForAblyResponse(messageId, 30000);
        // Validate the complete response
        const responseAssertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, [
            () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.id'),
            () => assertions_1.CustomAssertions.assertFieldExists({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.response'),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.flowId', flowId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.agentId', agentId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.userId', chatData.userId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.sessionId', chatData.sessionId),
            () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'success'),
            () => assertions_1.CustomAssertions.assertTimestampFormat({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.timestamp'),
            () => assertions_1.CustomAssertions.assertFieldType({ success: true, data: response, statusCode: 200, timestamp: new Date().toISOString() }, 'data.processingTime', 'number')
        ]);
        // Log test result
        const testResult = helpers_1.TestHelpers.generateTestResult('Complete Agent Creation Flow', [...flowAssertions, ...agentAssertions, ...deployAssertions, ...deploymentCompleteAssertions, ...chatAssertions, ...responseAssertions], Date.now());
        helpers_1.TestHelpers.logTestResult(testResult);
        // Final validations
        (0, test_1.expect)(response.id).toBeDefined();
        (0, test_1.expect)(response.response).toBeDefined();
        (0, test_1.expect)(response.flowId).toBe(flowId);
        (0, test_1.expect)(response.agentId).toBe(agentId);
        (0, test_1.expect)(response.userId).toBe(chatData.userId);
        (0, test_1.expect)(response.sessionId).toBe(chatData.sessionId);
        (0, test_1.expect)(response.status).toBe('success');
        (0, test_1.expect)(response.processingTime).toBeGreaterThan(0);
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
    test_1.test.afterEach(async () => {
        console.log('🧹 Cleaning up test resources...');
        // Cleanup: Cancel deployment if it exists
        if (testContext.deploymentId) {
            try {
                await deploymentClient.cancelDeployment(testContext.deploymentId);
                console.log(`✅ Deployment ${testContext.deploymentId} cancelled`);
            }
            catch (error) {
                console.log(`⚠️  Failed to cleanup deployment ${testContext.deploymentId}:`, error);
            }
        }
        // Cleanup: Delete the agent if it exists
        if (testContext.agentId) {
            try {
                await agentClient.deleteAgent(testContext.agentId);
                console.log(`✅ Agent ${testContext.agentId} deleted`);
            }
            catch (error) {
                console.log(`⚠️  Failed to cleanup agent ${testContext.agentId}:`, error);
            }
        }
        // Cleanup: Delete the flow if it exists
        if (testContext.flowId) {
            try {
                await flowClient.deleteFlow(testContext.flowId);
                console.log(`✅ Flow ${testContext.flowId} deleted`);
            }
            catch (error) {
                console.log(`⚠️  Failed to cleanup flow ${testContext.flowId}:`, error);
            }
        }
        console.log('✅ Cleanup completed');
    });
});
