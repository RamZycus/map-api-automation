import { test, expect, APIRequestContext } from '@playwright/test';
import { ApiHelper } from '../../src/Framework/ApiHelper';
import { JsonOperations } from '../../src/Framework/JsonOperations';

test.describe('MAP API - Complete Flow and Agent Management @map-api @complete-workflow', () => {
  let apiHelper: ApiHelper;
  let testContext: any;

  test.beforeEach(async ({ request }: { request: APIRequestContext }) => {
    apiHelper = new ApiHelper(request);
    testContext = {};
  });

  test('Complete MAP API Workflow: Create Flow -> Create Agent -> Fetch Agents -> Delete Agent @flow-management @agent-management', async () => {
    // Step 1: Create a new flow
    console.log('🚀 Step 1: Creating a new flow...');
    const flowData = JsonOperations.getTestData('flows.validFlow');
    const createFlowResponse = await apiHelper.post('/map-bk/api/v1/flows', flowData);
    
    expect(createFlowResponse.success).toBe(true);
    expect(createFlowResponse.statusCode).toBe(201);
    expect(createFlowResponse.data).toHaveProperty('id');
    expect(createFlowResponse.data.name).toBe(flowData.name);
    
    testContext.flowId = createFlowResponse.data.id;
    console.log('✅ Flow created successfully with ID:', testContext.flowId);

    // Step 2: Fetch all flows to verify creation
    console.log('🔍 Step 2: Fetching all flows...');
    const getAllFlowsResponse = await apiHelper.get('/map-bk/api/v1/flows');
    
    expect(getAllFlowsResponse.success).toBe(true);
    expect(getAllFlowsResponse.statusCode).toBe(200);
    expect(Array.isArray(getAllFlowsResponse.data)).toBe(true);
    
    const createdFlow = getAllFlowsResponse.data.find((flow: any) => flow.id === testContext.flowId);
    expect(createdFlow).toBeDefined();
    console.log('✅ Flow found in the list');

    // Step 3: Fetch specific flow by ID
    console.log('🔍 Step 3: Fetching specific flow by ID...');
    const getFlowResponse = await apiHelper.get(`/map-bk/api/v1/flows/${testContext.flowId}`);
    
    expect(getFlowResponse.success).toBe(true);
    expect(getFlowResponse.statusCode).toBe(200);
    expect(getFlowResponse.data.id).toBe(testContext.flowId);
    expect(getFlowResponse.data.name).toBe(flowData.name);
    console.log('✅ Specific flow retrieved successfully');

    // Step 4: Fetch agents by flow ID (should include router agent)
    console.log('🔍 Step 4: Fetching agents by flow ID...');
    const getAgentsResponse = await apiHelper.get('/map-bk/api/v1/agents', { flowId: testContext.flowId });
    
    expect(getAgentsResponse.success).toBe(true);
    expect(getAgentsResponse.statusCode).toBe(200);
    expect(Array.isArray(getAgentsResponse.data)).toBe(true);
    
    // Verify router agent exists
    const routerAgent = getAgentsResponse.data.find((agent: any) => agent.type === 'SYSTEM');
    expect(routerAgent).toBeDefined();
    expect(routerAgent.name).toBe('Router Agent');
    console.log('✅ Router agent found in the flow');

    // Step 5: Create a new agent in the flow
    console.log('🤖 Step 5: Creating a new agent...');
    const agentData = JsonOperations.getTestData('agents.validAgent');
    agentData.flowId = testContext.flowId; // Use the created flow ID
    
    const createAgentResponse = await apiHelper.post('/map-bk/api/v1/agents', agentData);
    
    expect(createAgentResponse.success).toBe(true);
    expect(createAgentResponse.statusCode).toBe(201);
    expect(createAgentResponse.data).toHaveProperty('id');
    expect(createAgentResponse.data.name).toBe(agentData.name);
    expect(createAgentResponse.data.flowId).toBe(testContext.flowId);
    
    testContext.agentId = createAgentResponse.data.id;
    console.log('✅ Agent created successfully with ID:', testContext.agentId);

    // Step 6: Create a redirection agent
    console.log('🔄 Step 6: Creating a redirection agent...');
    const redirectionAgentData = JsonOperations.getTestData('agents.redirectionAgent');
    redirectionAgentData.flowId = testContext.flowId;
    
    const createRedirectionAgentResponse = await apiHelper.post('/map-bk/api/v1/agents', redirectionAgentData);
    
    expect(createRedirectionAgentResponse.success).toBe(true);
    expect(createRedirectionAgentResponse.statusCode).toBe(201);
    expect(createRedirectionAgentResponse.data.name).toBe('Redirection Agent');
    expect(createRedirectionAgentResponse.data.type).toBe('USER');
    
    testContext.redirectionAgentId = createRedirectionAgentResponse.data.id;
    console.log('✅ Redirection agent created successfully with ID:', testContext.redirectionAgentId);

    // Step 7: Get specific agent by ID
    console.log('🔍 Step 7: Fetching specific agent by ID...');
    const getAgentResponse = await apiHelper.get(`/map-bk/api/v1/agents/${testContext.agentId}`);
    
    expect(getAgentResponse.success).toBe(true);
    expect(getAgentResponse.statusCode).toBe(200);
    expect(getAgentResponse.data.id).toBe(testContext.agentId);
    expect(getAgentResponse.data.name).toBe(agentData.name);
    console.log('✅ Specific agent retrieved successfully');

    // Step 8: Fetch agents by flow ID again (should now include both agents)
    console.log('🔍 Step 8: Fetching all agents in the flow...');
    const getAllAgentsResponse = await apiHelper.get('/map-bk/api/v1/agents', { flowId: testContext.flowId });
    
    expect(getAllAgentsResponse.success).toBe(true);
    expect(getAllAgentsResponse.statusCode).toBe(200);
    expect(getAllAgentsResponse.data.length).toBeGreaterThanOrEqual(3); // Router + 2 created agents
    
    // Verify all agents are present
    const createdAgent = getAllAgentsResponse.data.find((agent: any) => agent.id === testContext.agentId);
    const redirectionAgent = getAllAgentsResponse.data.find((agent: any) => agent.id === testContext.redirectionAgentId);
    
    expect(createdAgent).toBeDefined();
    expect(redirectionAgent).toBeDefined();
    console.log('✅ All agents found in the flow');

    // Step 9: Delete the created agents
    console.log('🗑️ Step 9: Deleting created agents...');
    const deleteAgentsResponse = await apiHelper.delete('/map-bk/api/v1/agents', {
      agentIds: [testContext.agentId, testContext.redirectionAgentId]
    });
    
    expect(deleteAgentsResponse.success).toBe(true);
    expect(deleteAgentsResponse.data).toContain('Successfully deleted');
    console.log('✅ Agents deleted successfully');

    // Step 10: Verify agents are deleted
    console.log('🔍 Step 10: Verifying agents are deleted...');
    const verifyDeletionResponse = await apiHelper.get('/map-bk/api/v1/agents', { flowId: testContext.flowId });
    
    expect(verifyDeletionResponse.success).toBe(true);
    expect(verifyDeletionResponse.statusCode).toBe(200);
    
    // Should only have router agent left
    const remainingAgents = verifyDeletionResponse.data.filter((agent: any) => 
      agent.id !== testContext.agentId && agent.id !== testContext.redirectionAgentId
    );
    expect(remainingAgents.length).toBeLessThanOrEqual(1); // Only router agent should remain
    console.log('✅ Agent deletion verified');

    console.log('🎉 Complete MAP API workflow test completed successfully!');
  });

  test('MAP API Error Handling: Invalid Flow Data @error-handling @flow-validation', async () => {
    console.log('❌ Testing error handling with invalid flow data...');
    
    const invalidFlowData = JsonOperations.getTestData('flows.invalidFlow');
    const errorResponse = await apiHelper.post('/map-bk/api/v1/flows', invalidFlowData);
    
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.statusCode).toBeGreaterThanOrEqual(400);
    console.log('✅ Error handling test passed');
  });

  test('MAP API Error Handling: Invalid Agent Data @error-handling @agent-validation', async () => {
    console.log('❌ Testing error handling with invalid agent data...');
    
    const invalidAgentData = JsonOperations.getTestData('agents.invalidAgent');
    const errorResponse = await apiHelper.post('/map-bk/api/v1/agents', invalidAgentData);
    
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.statusCode).toBeGreaterThanOrEqual(400);
    console.log('✅ Error handling test passed');
  });

  test('MAP API: Test with Dynamic Data Generation @dynamic-data @data-generation', async () => {
    console.log('🔄 Testing with dynamic data generation...');
    
    // Generate dynamic flow data
    const baseFlowData = JsonOperations.getTestData('flows.validFlow');
    const dynamicFlowData = JsonOperations.createDynamicTestData(baseFlowData, {
      name: `Dynamic_Flow_${Date.now()}`,
      description: `Dynamic flow created at ${new Date().toISOString()}`
    });
    
    const createFlowResponse = await apiHelper.post('/map-bk/api/v1/flows', dynamicFlowData);
    expect(createFlowResponse.success).toBe(true);
    expect(createFlowResponse.data.name).toBe(dynamicFlowData.name);
    
    const flowId = createFlowResponse.data.id;
    console.log('✅ Dynamic flow created with ID:', flowId);
    
    // Generate dynamic agent data
    const baseAgentData = JsonOperations.getTestData('agents.validAgent');
    const dynamicAgentData = JsonOperations.createDynamicTestData(baseAgentData, {
      flowId: flowId,
      name: `Dynamic_Agent_${Date.now()}`,
      description: `Dynamic agent created at ${new Date().toISOString()}`
    });
    
    const createAgentResponse = await apiHelper.post('/map-bk/api/v1/agents', dynamicAgentData);
    expect(createAgentResponse.success).toBe(true);
    expect(createAgentResponse.data.name).toBe(dynamicAgentData.name);
    
    console.log('✅ Dynamic agent created with ID:', createAgentResponse.data.id);
    console.log('🎉 Dynamic data generation test completed successfully!');
  });
});
