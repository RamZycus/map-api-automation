# MAP API Automation Framework

A clean, reusable API automation framework using Playwright with Gherkin/BDD support.

## 🏗️ Framework Structure

```
src/
├── jsonRepository/           # API payload templates
│   ├── createAgentPost.json
│   ├── createFlowPost.json
│   ├── deleteAgentPost.json
│   ├── deleteFlowPost.json
│   └── testData.json
├── Framework/
│   ├── PayloadBuilder.ts     # Dynamic payload builder
│   ├── EnhancedApiHelper.ts  # API helper with payload support
│   └── ApiHelper.ts          # Basic API helper
└── MAP/
    ├── features/
    │   └── api-testing.feature
    └── implementation/
        └── api-testing.steps.ts
```

## 🚀 Quick Start

### 1. JSON Repository
All API payloads are stored in `src/jsonRepository/` with descriptive names:

- `createAgentPost.json` - Default agent creation payload
- `createFlowPost.json` - Default flow creation payload
- `deleteAgentPost.json` - Agent deletion payload
- `deleteFlowPost.json` - Flow deletion payload
- `testData.json` - Test data and configuration

### 2. Writing Gherkin Tests

```gherkin
@createAgent
Scenario: Create Agent with Custom Values
  Given I prepare default post request for api "createAgentPost"
  And I set value for header field "x-zycus-access-token" to value of attribute "payload.accessToken" from dump
  And I set value for header field "x-zycus-device-id" to "123456"
  And I set value for field "flowId" to variable "flowId"
  And I set value for field "name" to "Redirection Agent"
  When I submit post request for api "createAgentPost"
  Then I validate response is successful
  And I validate fields "id,flowId,name"
  And I store "id" as "agentId"
```

### 3. Tag-Based Execution

Run specific test scenarios using tags:

```bash
# Run all Gherkin tests
npm run test:gherkin

# Run specific tagged scenarios
npm run test:createAgent
npm run test:createFlow
npm run test:getAgent
npm run test:deleteAgent
npm run test:deleteFlow
npm run test:completeWorkflow
```

## 📋 Available Gherkin Steps

### Request Preparation
- `Given I prepare default {method} request for api "{apiName}"`
- `And I set value for header field "{headerName}" to "{value}"`
- `And I set value for header field "{headerName}" to value of attribute "{attributePath}" from dump`
- `And I set value for field "{fieldPath}" to "{value}"`
- `And I set value for field "{fieldPath}" to variable "{variableName}"`

### Request Execution
- `When I submit {method} request for api "{apiName}"`

### Response Validation
- `Then I validate response is successful`
- `Then I validate response status is {statusCode}`
- `Then I validate fields "{field1,field2,field3}"`
- `Then I validate field "{fieldPath}" equals "{expectedValue}"`
- `Then I validate field "{fieldPath}" contains "{expectedValue}"`
- `Then I store "{fieldPath}" as "{variableName}"`

## 🔧 Dynamic Payload Building

The framework automatically:
1. **Loads default payload** from JSON repository
2. **Applies overrides** specified in Gherkin steps
3. **Resolves variables** like `{flowId}`, `{agentId}`
4. **Handles test data** from `testData.json`

### Example Payload Flow:
```json
// Default from createAgentPost.json
{
  "name": "Test Automation Agent",
  "description": "Agent created for automated testing",
  "flowId": "",
  "type": "custom"
}

// After Gherkin overrides
{
  "name": "Redirection Agent",        // Overridden
  "description": "Agent created for automated testing", // Default
  "flowId": "68c712caaf08ee6f35caf626", // Variable resolved
  "type": "custom"                    // Default
}
```

## 🏷️ Tag System

Each scenario can be tagged for selective execution:

- `@createAgent` - Agent creation tests
- `@createFlow` - Flow creation tests
- `@getAgent` - Agent retrieval tests
- `@deleteAgent` - Agent deletion tests
- `@deleteFlow` - Flow deletion tests
- `@completeWorkflow` - End-to-end workflow tests

## 📊 Allure Reporting

Generate beautiful test reports:

```bash
# Run tests and generate Allure report
npx playwright test --project=gherkin-tests
npx allure serve allure-results
```

## 🎯 Benefits

1. **Easy Test Writing** - Business-readable Gherkin syntax
2. **Reusable Payloads** - JSON templates with dynamic overrides
3. **Tag-Based Execution** - Run specific test scenarios
4. **Clean Separation** - Payloads, steps, and features separated
5. **Allure Integration** - Beautiful test reports
6. **Variable Management** - Automatic variable resolution and storage

## 🔄 Workflow Example

```gherkin
@completeWorkflow
Scenario: Complete Flow and Agent Lifecycle
  # 1. Create Flow
  Given I prepare default post request for api "createFlowPost"
  When I submit post request for api "createFlowPost"
  Then I store "id" as "flowId"
  
  # 2. Create Agent
  Given I prepare default post request for api "createAgentPost"
  And I set value for field "flowId" to variable "flowId"
  When I submit post request for api "createAgentPost"
  Then I store "id" as "agentId"
  
  # 3. Get Agent
  Given I prepare default get request for api "getAgent"
  When I submit get request for api "getAgent"
  Then I validate response is successful
  
  # 4. Delete Agent
  Given I prepare default delete request for api "deleteAgentPost"
  And I set value for field "agentIds" to variable "agentId"
  When I submit delete request for api "deleteAgentPost"
  Then I validate response is successful
  
  # 5. Delete Flow
  Given I prepare default delete request for api "deleteFlowPost"
  And I set value for field "flowIds" to variable "flowId"
  When I submit delete request for api "deleteFlowPost"
  Then I validate response is successful
```

This framework makes API testing **simple, readable, and maintainable**! 🎉
