# MAP API Automation Framework

A **generic, reusable API automation framework** built with Playwright and TypeScript specifically configured for **MAP (Merlin Agentic Platform) API** testing. Includes **Gherkin/BDD support** for business-readable tests.

## 🎯 **Key Features**

- **🔧 Generic Framework**: Test any API endpoint without writing API-specific code
- **🥒 Gherkin/BDD Support**: Write tests in natural language using `.feature` files
- **📊 JSON Data Repository**: Centralized test data management for MAP API
- **🔄 Reusable Components**: Framework utilities that work with any API
- **📈 Comprehensive Reporting**: HTML, JSON, and JUnit reports
- **⚡ Easy Configuration**: Simple environment setup for MAP API
- **🤖 MAP API Specific**: Pre-configured for Flow and Agent management

## 📁 **Project Structure**

```
├── src/
│   ├── Framework/                 # Generic framework utilities
│   │   ├── ApiHelper.ts          # Generic API client
│   │   ├── JsonOperations.ts     # JSON data management
│   │   └── Utilities.ts          # Common utilities
│   ├── iRequest/                 # MAP API specific tests
│   │   ├── features/            # Gherkin feature files
│   │   │   └── api-testing.feature
│   │   └── implementation/      # Step definitions
│   │       └── api-testing.steps.ts
│   └── jsonRepository/          # MAP API test data
│       └── test-data.json
├── tests/
│   ├── examples/               # Example tests
│   │   └── map-api-complete-workflow.spec.ts
│   ├── api/                   # API tests
│   ├── integration/           # Integration tests
│   └── smoke/                 # Smoke tests
└── config/                    # Configuration files
```

## 🚀 **Quick Start**

### 1. **Install Dependencies**
```bash
npm install
npm run install:browsers
```

### 2. **Configure Environment**
Create `.env` file:
```env
BASE_URL=http://hpx-up1.app.inmu.qc.zycus.local:39405
API_KEY=your-api-key-here
NODE_ENV=development
```

### 3. **Run Tests**
```bash
# Run all tests
npm test

# Run Gherkin tests
npm run test:gherkin

# Run MAP API specific test
npx playwright test tests/examples/map-api-complete-workflow.spec.ts
```

## 🔧 **MAP API Endpoints Supported**

### **Flow Management**
- **Create Flow**: `POST /map-bk/api/v1/flows`
- **Get All Flows**: `GET /map-bk/api/v1/flows`
- **Get Flow by ID**: `GET /map-bk/api/v1/flows/{id}`

### **Agent Management**
- **Create Agent**: `POST /map-bk/api/v1/agents`
- **Get Agents by Flow ID**: `GET /map-bk/api/v1/agents?flowId={flowId}`
- **Get Agent by ID**: `GET /map-bk/api/v1/agents/{id}`
- **Delete Agents**: `DELETE /map-bk/api/v1/agents`

## 🥒 **Gherkin/BDD Testing**

### **Feature File** (`src/iRequest/features/api-testing.feature`)

```gherkin
Feature: MAP API Testing - Flow and Agent Management
  As a tester
  I want to test MAP API endpoints for flow and agent management
  So that I can validate the complete agent creation workflow

  Scenario: Create a new flow
    Given I want to test a POST endpoint "/map-bk/api/v1/flows"
    And I have valid flow data
    When I send a POST request with the flow data
    Then I should receive a successful response
    And the response should contain flow details
    And the flow should have a valid ID

  Scenario: Create a new agent
    Given I want to test a POST endpoint "/map-bk/api/v1/agents"
    And I have valid agent data
    When I send a POST request with the agent data
    Then I should receive a successful response
    And the response should contain agent details
    And the agent should have a valid ID
```

## 📊 **Test Data Repository**

### **JSON Test Data** (`src/jsonRepository/test-data.json`)

```json
{
  "flows": {
    "validFlow": {
      "name": "Test_Auto_Flow_001",
      "description": "Test Auto Flow for automation testing",
      "logoPath": "/public/images/ANA.svg"
    }
  },
  "agents": {
    "validAgent": {
      "flowId": "68c6cababbb2e4a9d6575433",
      "name": "Test Automation Agent",
      "description": "This is a test agent created for automation testing purposes.",
      "isActive": true,
      "type": "USER",
      "sections": [...]
    },
    "redirectionAgent": {
      "flowId": "68c6cababbb2e4a9d6575433",
      "name": "Redirection Agent",
      "description": "You are the Redirection Agent operating within a multi-agent architecture.",
      "isActive": true,
      "type": "USER",
      "sections": [...]
    }
  }
}
```

## 🎯 **Real-World Examples**

### **Example 1: Complete MAP API Workflow**

```typescript
test('Complete MAP API Workflow', async () => {
  // Step 1: Create a new flow
  const flowData = JsonOperations.getTestData('flows.validFlow');
  const createFlowResponse = await apiHelper.post('/map-bk/api/v1/flows', flowData);
  expect(createFlowResponse.success).toBe(true);
  const flowId = createFlowResponse.data.id;

  // Step 2: Create a new agent in the flow
  const agentData = JsonOperations.getTestData('agents.validAgent');
  agentData.flowId = flowId;
  const createAgentResponse = await apiHelper.post('/map-bk/api/v1/agents', agentData);
  expect(createAgentResponse.success).toBe(true);

  // Step 3: Fetch agents by flow ID
  const getAgentsResponse = await apiHelper.get('/map-bk/api/v1/agents', { flowId });
  expect(getAgentsResponse.success).toBe(true);
  expect(Array.isArray(getAgentsResponse.data)).toBe(true);

  // Step 4: Verify router agent exists
  const routerAgent = getAgentsResponse.data.find((agent: any) => agent.type === 'SYSTEM');
  expect(routerAgent).toBeDefined();
  expect(routerAgent.name).toBe('Router Agent');
});
```

### **Example 2: Gherkin Test for MAP API**

```gherkin
Feature: MAP API Testing
  Scenario: Complete flow - Create flow, create agent, fetch agents
    Given I want to test the complete flow workflow
    When I create a new flow
    And I create a new agent in the flow
    And I fetch agents by flow ID
    Then I should see the created agent in the response
    And I should see the router agent in the response
```

### **Example 3: Error Handling**

```typescript
test('MAP API Error Handling', async () => {
  const invalidFlowData = JsonOperations.getTestData('flows.invalidFlow');
  const errorResponse = await apiHelper.post('/map-bk/api/v1/flows', invalidFlowData);
  
  expect(errorResponse.success).toBe(false);
  expect(errorResponse.statusCode).toBeGreaterThanOrEqual(400);
});
```

## 🔧 **Configuration**

### **Environment Variables**

```env
# MAP API Configuration
BASE_URL=http://hpx-up1.app.inmu.qc.zycus.local:39405
API_KEY=your-api-key

# Test Configuration
NODE_ENV=development
TEST_TIMEOUT=30000
TEST_RETRIES=3

# Optional: Chat API Configuration
CHAT_API_URL=http://hpx-up1.app.inmu.qc.zycus.local:39405/chat-api
ABLY_API_KEY=your-ably-api-key
ABLY_CHANNEL=test-channel
```

## 📈 **Running Tests**

### **Tag-Based Execution**

Run specific API tests using tags:

```bash
# Run all MAP API tests
npm run test:map-api

# Run flow management tests
npm run test:flow-management

# Run agent management tests
npm run test:agent-management

# Run error handling tests
npm run test:error-handling

# Run complete workflow tests
npm run test:complete-workflow

# Run dynamic data tests
npm run test:dynamic-data
```

### **Project-Based Execution**

```bash
# Run smoke tests
npm run test:smoke

# Run API tests
npm run test:api

# Run integration tests
npm run test:integration

# Run examples
npm run test:examples
```

### **Interactive Test Runner**

Use the provided scripts for interactive test execution:

```bash
# Linux/Mac
./run-tests.sh

# Windows
run-tests.bat
```

### **Basic Commands**

```bash
# Run all tests
npm test

# Run Gherkin tests
npm run test:gherkin

# Run MAP API specific test
npx playwright test tests/examples/map-api-complete-workflow.spec.ts

# Run tests with specific project
npx playwright test --project=api-tests
npx playwright test --project=gherkin-tests
```

## 🎯 **MAP API Specific Features**

### **1. Flow Management**
- **Create Flows**: Test flow creation with various data
- **Fetch Flows**: Test flow retrieval (all and specific)
- **Flow Validation**: Validate flow structure and properties

### **2. Agent Management**
- **Create Agents**: Test agent creation with different types
- **Router Agent**: Automatically created when flow is created
- **Agent Types**: Support for USER and SYSTEM agents
- **Agent Sections**: Test complex agent configurations

### **3. Redirection Agent**
- **Specialized Agent**: Pre-configured redirection agent
- **Workflow Steps**: Test complex workflow configurations
- **Multi-step Process**: Test multi-step agent workflows

### **4. Error Handling**
- **Invalid Data**: Test with invalid flow/agent data
- **Missing Fields**: Test required field validation
- **Type Validation**: Test data type validation

## 🔍 **Advanced Usage**

### **Dynamic Test Data Generation**

```typescript
// Generate dynamic flow data
const baseFlowData = JsonOperations.getTestData('flows.validFlow');
const dynamicFlowData = JsonOperations.createDynamicTestData(baseFlowData, {
  name: `Dynamic_Flow_${Date.now()}`,
  description: `Dynamic flow created at ${new Date().toISOString()}`
});
```

### **Custom Step Definitions**

```typescript
// Custom step for MAP API specific logic
Given('I have a valid flow ID', async function () {
  flowId = '68c6cababbb2e4a9d6575433'; // Test flow ID
});

When('I create a new agent in the flow', async function () {
  const agentData = JsonOperations.getTestData('agents.validAgent');
  agentData.flowId = flowId;
  const agentResponse = await apiHelper.post('/map-bk/api/v1/agents', agentData);
  agentId = agentResponse.data.id;
});
```

### **API Response Validation**

```typescript
// Validate MAP API response structure
const response = await apiHelper.get('/map-bk/api/v1/flows');
expect(response.success).toBe(true);
expect(Array.isArray(response.data)).toBe(true);

// Validate flow structure
const flow = response.data[0];
expect(flow).toHaveProperty('id');
expect(flow).toHaveProperty('name');
expect(flow).toHaveProperty('description');
expect(flow).toHaveProperty('createdAt');
```

## 🚀 **Getting Started with MAP API**

### **Step 1: Configure MAP API**
```env
BASE_URL=http://hpx-up1.app.inmu.qc.zycus.local:39405
API_KEY=your-map-api-key
```

### **Step 2: Run Example Test**
```bash
npx playwright test tests/examples/map-api-complete-workflow.spec.ts
```

### **Step 3: Run Gherkin Tests**
```bash
npm run test:gherkin
```

### **Step 4: Customize for Your Needs**
- Update test data in `src/jsonRepository/test-data.json`
- Add new scenarios in `src/iRequest/features/api-testing.feature`
- Create custom step definitions in `src/iRequest/implementation/`

## 📚 **Best Practices**

### **1. Test Data Management**
- Use descriptive names for test data
- Group related data together (flows, agents)
- Include both valid and invalid test cases

### **2. Gherkin Writing**
- Write clear, business-focused scenarios
- Use Given-When-Then structure
- Keep scenarios focused and atomic

### **3. MAP API Specific**
- Always test router agent creation
- Validate agent sections and workflows
- Test both USER and SYSTEM agent types

### **4. Test Organization**
- Group related tests together
- Use descriptive test names
- Include both positive and negative test cases

## 🆘 **Support**

For questions and support:

1. **Check Examples**: Review the example tests in `tests/examples/`
2. **Read Documentation**: Check the feature files for usage examples
3. **Framework Utilities**: Explore `src/Framework/` for available methods
4. **Test Data**: Check `src/jsonRepository/` for MAP API data structure examples

---

**🎉 Happy Testing with the MAP API Automation Framework!**