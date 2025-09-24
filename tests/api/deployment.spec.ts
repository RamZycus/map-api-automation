import { test, expect } from '@playwright/test';
import { FlowClient } from '../../src/api/flow-client';
import { AgentClient } from '../../src/api/agent-client';
import { DeploymentClient } from '../../src/api/deployment-client';
import { DataGenerator } from '../../src/utils/data-generator';
import { CustomAssertions } from '../../src/utils/assertions';
import { TestHelpers } from '../../src/utils/helpers';
import { DeployAgentRequest, PromoteAgentRequest, Deployment } from '../../src/types/api-types';

test.describe('Deployment and Promotion Operations', () => {
  let flowClient: FlowClient;
  let agentClient: AgentClient;
  let deploymentClient: DeploymentClient;
  let testContext: any;

  test.beforeEach(async ({ request }) => {
    flowClient = new FlowClient(request);
    agentClient = new AgentClient(request);
    deploymentClient = new DeploymentClient(request);
    testContext = TestHelpers.createTestContext();
  });

  test.describe('Deploy Agent', () => {
    test('should deploy an agent to development environment', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Deploy the agent
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development',
        metadata: {
          deployedBy: 'automation-test',
          version: '1.0.0'
        }
      };
      
      const response = await deploymentClient.deployAgent(deployData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldExists(response, 'data.id'),
        () => CustomAssertions.assertFieldValue(response, 'data.agentId', agentId),
        () => CustomAssertions.assertFieldValue(response, 'data.flowId', flowId),
        () => CustomAssertions.assertFieldValue(response, 'data.environment', 'development'),
        () => CustomAssertions.assertFieldValue(response, 'data.status', 'pending'),
        () => CustomAssertions.assertTimestampFormat(response, 'data.createdAt')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.agentId).toBe(agentId);
      expect(response.data.environment).toBe('development');
    });

    test('should deploy an agent to staging environment', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Deploy the agent to staging
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'staging',
        metadata: {
          deployedBy: 'automation-test',
          version: '1.0.0'
        }
      };
      
      const response = await deploymentClient.deployAgent(deployData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldValue(response, 'data.environment', 'staging')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.environment).toBe('staging');
    });

    test('should deploy an agent to production environment', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Deploy the agent to production
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'production',
        metadata: {
          deployedBy: 'automation-test',
          version: '1.0.0'
        }
      };
      
      const response = await deploymentClient.deployAgent(deployData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 201),
        () => CustomAssertions.assertFieldValue(response, 'data.environment', 'production')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = response.data.id;
      
      expect(response.success).toBe(true);
      expect(response.data.environment).toBe('production');
    });

    test('should fail to deploy a non-existent agent', async () => {
      const nonExistentAgentId = DataGenerator.generateAgentId();
      const flowId = DataGenerator.generateFlowId();
      
      const deployData: DeployAgentRequest = {
        agentId: nonExistentAgentId,
        flowId,
        environment: 'development'
      };
      
      const response = await deploymentClient.deployAgent(deployData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'agent not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });

    test('should fail to deploy an agent with invalid environment', async () => {
      // First create a flow and agent
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      // Try to deploy with invalid environment
      const deployData = {
        agentId,
        flowId,
        environment: 'invalid-environment'
      } as DeployAgentRequest;
      
      const response = await deploymentClient.deployAgent(deployData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 400),
        () => CustomAssertions.assertErrorMessage(response, 'invalid environment')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
    });
  });

  test.describe('Get Deployment', () => {
    test('should get a deployment by ID', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      const deployResponse = await deploymentClient.deployAgent(deployData);
      const deploymentId = deployResponse.data.id;
      
      // Get the deployment
      const response = await deploymentClient.getDeployment(deploymentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.id', deploymentId),
        () => CustomAssertions.assertFieldValue(response, 'data.agentId', agentId),
        () => CustomAssertions.assertFieldValue(response, 'data.flowId', flowId)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = deploymentId;
      
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(deploymentId);
    });

    test('should get deployments by agent ID', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      await deploymentClient.deployAgent(deployData);
      
      // Get deployments by agent ID
      const response = await deploymentClient.getDeploymentsByAgent(agentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 1)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);
    });

    test('should get deployments by flow ID', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      await deploymentClient.deployAgent(deployData);
      
      // Get deployments by flow ID
      const response = await deploymentClient.getDeploymentsByFlow(flowId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertArrayMinLength(response, 1)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);
    });

    test('should fail to get a non-existent deployment', async () => {
      const nonExistentDeploymentId = DataGenerator.generateDeploymentId();
      
      const response = await deploymentClient.getDeployment(nonExistentDeploymentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Promote Deployment', () => {
    test('should promote a deployment from development to staging', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      const deployResponse = await deploymentClient.deployAgent(deployData);
      const deploymentId = deployResponse.data.id;
      
      // Promote the deployment
      const promoteData: PromoteAgentRequest = {
        deploymentId,
        targetEnvironment: 'staging',
        metadata: {
          promotedBy: 'automation-test',
          promotionReason: 'testing'
        }
      };
      
      const response = await deploymentClient.promoteDeployment(deploymentId, promoteData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.environment', 'staging')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = deploymentId;
      
      expect(response.success).toBe(true);
      expect(response.data.environment).toBe('staging');
    });

    test('should promote a deployment from staging to production', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'staging'
      };
      const deployResponse = await deploymentClient.deployAgent(deployData);
      const deploymentId = deployResponse.data.id;
      
      // Promote the deployment
      const promoteData: PromoteAgentRequest = {
        deploymentId,
        targetEnvironment: 'production',
        metadata: {
          promotedBy: 'automation-test',
          promotionReason: 'production-ready'
        }
      };
      
      const response = await deploymentClient.promoteDeployment(deploymentId, promoteData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.environment', 'production')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = deploymentId;
      
      expect(response.success).toBe(true);
      expect(response.data.environment).toBe('production');
    });

    test('should fail to promote a non-existent deployment', async () => {
      const nonExistentDeploymentId = DataGenerator.generateDeploymentId();
      
      const promoteData: PromoteAgentRequest = {
        deploymentId: nonExistentDeploymentId,
        targetEnvironment: 'staging'
      };
      
      const response = await deploymentClient.promoteDeployment(nonExistentDeploymentId, promoteData);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Deployment Status', () => {
    test('should wait for deployment to complete', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      const deployResponse = await deploymentClient.deployAgent(deployData);
      const deploymentId = deployResponse.data.id;
      
      // Wait for deployment to complete
      const deployment = await deploymentClient.waitForDeploymentCompletion(deploymentId, 60000);
      
      const assertions = CustomAssertions.runAssertions({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, [
        () => CustomAssertions.assertFieldValue({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'deployed')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = deploymentId;
      
      expect(deployment.status).toBe('deployed');
    });

    test('should wait for deployment to start', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      const deployResponse = await deploymentClient.deployAgent(deployData);
      const deploymentId = deployResponse.data.id;
      
      // Wait for deployment to start
      const deployment = await deploymentClient.waitForDeploymentStart(deploymentId, 30000);
      
      const assertions = CustomAssertions.runAssertions({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, [
        () => CustomAssertions.assertFieldValue({ success: true, data: deployment, statusCode: 200, timestamp: new Date().toISOString() }, 'data.status', 'deploying')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = deploymentId;
      
      expect(['deploying', 'deployed']).toContain(deployment.status);
    });

    test('should get deployment logs', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      const deployResponse = await deploymentClient.deployAgent(deployData);
      const deploymentId = deployResponse.data.id;
      
      // Get deployment logs
      const response = await deploymentClient.getDeploymentLogs(deploymentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldExists(response, 'data')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = deploymentId;
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  test.describe('Cancel Deployment', () => {
    test('should cancel a pending deployment', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      const deployResponse = await deploymentClient.deployAgent(deployData);
      const deploymentId = deployResponse.data.id;
      
      // Cancel the deployment
      const response = await deploymentClient.cancelDeployment(deploymentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200),
        () => CustomAssertions.assertFieldValue(response, 'data.status', 'cancelled')
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      testContext.deploymentId = deploymentId;
      
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('cancelled');
    });

    test('should fail to cancel a non-existent deployment', async () => {
      const nonExistentDeploymentId = DataGenerator.generateDeploymentId();
      
      const response = await deploymentClient.cancelDeployment(nonExistentDeploymentId);
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertStatusCode(response, 404),
        () => CustomAssertions.assertErrorMessage(response, 'not found')
      ]);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
    });
  });

  test.describe('Active Deployment', () => {
    test('should get active deployment for an agent', async () => {
      // First create a flow, agent, and deployment
      const flowData = DataGenerator.generateFlowData();
      const flowResponse = await flowClient.createFlow(flowData);
      const flowId = flowResponse.data.id;
      
      const agentData = DataGenerator.generateAgentData(flowId);
      const createResponse = await agentClient.createAgent(agentData);
      const agentId = createResponse.data.id;
      
      const deployData: DeployAgentRequest = {
        agentId,
        flowId,
        environment: 'development'
      };
      await deploymentClient.deployAgent(deployData);
      
      // Get active deployment
      const response = await deploymentClient.getActiveDeployment(agentId, 'development');
      
      const assertions = CustomAssertions.runAssertions(response, [
        () => CustomAssertions.assertApiSuccess(response),
        () => CustomAssertions.assertStatusCode(response, 200)
      ]);

      testContext.flowId = flowId;
      testContext.agentId = agentId;
      
      expect(response.success).toBe(true);
      // Active deployment might be null if not yet deployed
      expect(response.data === null || response.data.status === 'deployed').toBe(true);
    });
  });

  test.afterEach(async () => {
    // Cleanup: Cancel deployment if it exists
    if (testContext.deploymentId) {
      try {
        await deploymentClient.cancelDeployment(testContext.deploymentId);
      } catch (error) {
        console.log(`Failed to cleanup deployment ${testContext.deploymentId}:`, error);
      }
    }
    
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
