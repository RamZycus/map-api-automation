"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const flow_client_1 = require("../../src/api/flow-client");
const agent_client_1 = require("../../src/api/agent-client");
const deployment_client_1 = require("../../src/api/deployment-client");
const data_generator_1 = require("../../src/utils/data-generator");
const assertions_1 = require("../../src/utils/assertions");
const helpers_1 = require("../../src/utils/helpers");
test_1.test.describe('Deployment and Promotion Operations', () => {
    let flowClient;
    let agentClient;
    let deploymentClient;
    let testContext;
    test_1.test.beforeEach(async ({ request }) => {
        flowClient = new flow_client_1.FlowClient(request);
        agentClient = new agent_client_1.AgentClient(request);
        deploymentClient = new deployment_client_1.DeploymentClient(request);
        testContext = helpers_1.TestHelpers.createTestContext();
    });
    test_1.test.describe('Deploy Agent', () => {
        (0, test_1.test)('should deploy an agent to development environment', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Deploy the agent
            const deployData = {
                agentId,
                flowId,
                environment: 'development',
                metadata: {
                    deployedBy: 'automation-test',
                    version: '1.0.0'
                }
            };
            const response = await deploymentClient.deployAgent(deployData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data.id'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.agentId', agentId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.flowId', flowId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.environment', 'development'),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.status', 'pending'),
                () => assertions_1.CustomAssertions.assertTimestampFormat(response, 'data.createdAt')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.agentId).toBe(agentId);
            (0, test_1.expect)(response.data.environment).toBe('development');
        });
        (0, test_1.test)('should deploy an agent to staging environment', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Deploy the agent to staging
            const deployData = {
                agentId,
                flowId,
                environment: 'staging',
                metadata: {
                    deployedBy: 'automation-test',
                    version: '1.0.0'
                }
            };
            const response = await deploymentClient.deployAgent(deployData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.environment', 'staging')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.environment).toBe('staging');
        });
        (0, test_1.test)('should deploy an agent to production environment', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Deploy the agent to production
            const deployData = {
                agentId,
                flowId,
                environment: 'production',
                metadata: {
                    deployedBy: 'automation-test',
                    version: '1.0.0'
                }
            };
            const response = await deploymentClient.deployAgent(deployData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 201),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.environment', 'production')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = response.data.id;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.environment).toBe('production');
        });
        (0, test_1.test)('should fail to deploy a non-existent agent', async () => {
            const nonExistentAgentId = data_generator_1.DataGenerator.generateAgentId();
            const flowId = data_generator_1.DataGenerator.generateFlowId();
            const deployData = {
                agentId: nonExistentAgentId,
                flowId,
                environment: 'development'
            };
            const response = await deploymentClient.deployAgent(deployData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'agent not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
        (0, test_1.test)('should fail to deploy an agent with invalid environment', async () => {
            // First create a flow and agent
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            // Try to deploy with invalid environment
            const deployData = {
                agentId,
                flowId,
                environment: 'invalid-environment'
            };
            const response = await deploymentClient.deployAgent(deployData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 400),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'invalid environment')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(400);
        });
    });
    test_1.test.describe('Get Deployment', () => {
        (0, test_1.test)('should get a deployment by ID', async () => {
            // First create a flow, agent, and deployment
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
            const deployResponse = await deploymentClient.deployAgent(deployData);
            const deploymentId = deployResponse.data.id;
            // Get the deployment
            const response = await deploymentClient.getDeployment(deploymentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.id', deploymentId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.agentId', agentId),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.flowId', flowId)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = deploymentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.id).toBe(deploymentId);
        });
        (0, test_1.test)('should get deployments by agent ID', async () => {
            // First create a flow, agent, and deployment
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
            // Get deployments by agent ID
            const response = await deploymentClient.getDeploymentsByAgent(agentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 1)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.length).toBeGreaterThanOrEqual(1);
        });
        (0, test_1.test)('should get deployments by flow ID', async () => {
            // First create a flow, agent, and deployment
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
            // Get deployments by flow ID
            const response = await deploymentClient.getDeploymentsByFlow(flowId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertArrayMinLength(response, 1)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.length).toBeGreaterThanOrEqual(1);
        });
        (0, test_1.test)('should fail to get a non-existent deployment', async () => {
            const nonExistentDeploymentId = data_generator_1.DataGenerator.generateDeploymentId();
            const response = await deploymentClient.getDeployment(nonExistentDeploymentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Promote Deployment', () => {
        (0, test_1.test)('should promote a deployment from development to staging', async () => {
            // First create a flow, agent, and deployment
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
            const deployResponse = await deploymentClient.deployAgent(deployData);
            const deploymentId = deployResponse.data.id;
            // Promote the deployment
            const promoteData = {
                deploymentId,
                targetEnvironment: 'staging',
                metadata: {
                    promotedBy: 'automation-test',
                    promotionReason: 'testing'
                }
            };
            const response = await deploymentClient.promoteDeployment(deploymentId, promoteData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.environment', 'staging')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = deploymentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.environment).toBe('staging');
        });
        (0, test_1.test)('should promote a deployment from staging to production', async () => {
            // First create a flow, agent, and deployment
            const flowData = data_generator_1.DataGenerator.generateFlowData();
            const flowResponse = await flowClient.createFlow(flowData);
            const flowId = flowResponse.data.id;
            const agentData = data_generator_1.DataGenerator.generateAgentData(flowId);
            const createResponse = await agentClient.createAgent(agentData);
            const agentId = createResponse.data.id;
            const deployData = {
                agentId,
                flowId,
                environment: 'staging'
            };
            const deployResponse = await deploymentClient.deployAgent(deployData);
            const deploymentId = deployResponse.data.id;
            // Promote the deployment
            const promoteData = {
                deploymentId,
                targetEnvironment: 'production',
                metadata: {
                    promotedBy: 'automation-test',
                    promotionReason: 'production-ready'
                }
            };
            const response = await deploymentClient.promoteDeployment(deploymentId, promoteData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.environment', 'production')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = deploymentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.environment).toBe('production');
        });
        (0, test_1.test)('should fail to promote a non-existent deployment', async () => {
            const nonExistentDeploymentId = data_generator_1.DataGenerator.generateDeploymentId();
            const promoteData = {
                deploymentId: nonExistentDeploymentId,
                targetEnvironment: 'staging'
            };
            const response = await deploymentClient.promoteDeployment(nonExistentDeploymentId, promoteData);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Deployment Status', () => {
        (0, test_1.test)('should wait for deployment to complete', async () => {
            // First create a flow, agent, and deployment
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
            const deployResponse = await deploymentClient.deployAgent(deployData);
            const deploymentId = deployResponse.data.id;
            // Wait for deployment to complete
            const deployment = await deploymentClient.waitForDeploymentCompletion(deploymentId, 60000);
            const assertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, [
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'deployed')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = deploymentId;
            (0, test_1.expect)(deployment.status).toBe('deployed');
        });
        (0, test_1.test)('should wait for deployment to start', async () => {
            // First create a flow, agent, and deployment
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
            const deployResponse = await deploymentClient.deployAgent(deployData);
            const deploymentId = deployResponse.data.id;
            // Wait for deployment to start
            const deployment = await deploymentClient.waitForDeploymentStart(deploymentId, 30000);
            const assertions = assertions_1.CustomAssertions.runAssertions({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, [
                () => assertions_1.CustomAssertions.assertFieldValue({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'deploying')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = deploymentId;
            (0, test_1.expect)(['deploying', 'deployed']).toContain(deployment.status);
        });
        (0, test_1.test)('should get deployment logs', async () => {
            // First create a flow, agent, and deployment
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
            const deployResponse = await deploymentClient.deployAgent(deployData);
            const deploymentId = deployResponse.data.id;
            // Get deployment logs
            const response = await deploymentClient.getDeploymentLogs(deploymentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldExists(response, 'data')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = deploymentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(Array.isArray(response.data)).toBe(true);
        });
    });
    test_1.test.describe('Cancel Deployment', () => {
        (0, test_1.test)('should cancel a pending deployment', async () => {
            // First create a flow, agent, and deployment
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
            const deployResponse = await deploymentClient.deployAgent(deployData);
            const deploymentId = deployResponse.data.id;
            // Cancel the deployment
            const response = await deploymentClient.cancelDeployment(deploymentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200),
                () => assertions_1.CustomAssertions.assertFieldValue(response, 'data.status', 'cancelled')
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            testContext.deploymentId = deploymentId;
            (0, test_1.expect)(response.success).toBe(true);
            (0, test_1.expect)(response.data.status).toBe('cancelled');
        });
        (0, test_1.test)('should fail to cancel a non-existent deployment', async () => {
            const nonExistentDeploymentId = data_generator_1.DataGenerator.generateDeploymentId();
            const response = await deploymentClient.cancelDeployment(nonExistentDeploymentId);
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertStatusCode(response, 404),
                () => assertions_1.CustomAssertions.assertErrorMessage(response, 'not found')
            ]);
            (0, test_1.expect)(response.success).toBe(false);
            (0, test_1.expect)(response.statusCode).toBe(404);
        });
    });
    test_1.test.describe('Active Deployment', () => {
        (0, test_1.test)('should get active deployment for an agent', async () => {
            // First create a flow, agent, and deployment
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
            // Get active deployment
            const response = await deploymentClient.getActiveDeployment(agentId, 'development');
            const assertions = assertions_1.CustomAssertions.runAssertions(response, [
                () => assertions_1.CustomAssertions.assertApiSuccess(response),
                () => assertions_1.CustomAssertions.assertStatusCode(response, 200)
            ]);
            testContext.flowId = flowId;
            testContext.agentId = agentId;
            (0, test_1.expect)(response.success).toBe(true);
            // Active deployment might be null if not yet deployed
            (0, test_1.expect)(response.data === null || response.data.status === 'deployed').toBe(true);
        });
    });
    test_1.test.afterEach(async () => {
        // Cleanup: Cancel deployment if it exists
        if (testContext.deploymentId) {
            try {
                await deploymentClient.cancelDeployment(testContext.deploymentId);
            }
            catch (error) {
                console.log(`Failed to cleanup deployment ${testContext.deploymentId}:`, error);
            }
        }
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
