# Test Execution Guide - MAP API Automation Framework

This guide explains how to run specific API tests using tags and different execution strategies.

## 🏷️ **Tag-Based Test Execution**

### **Available Tags**

| Tag | Description | Usage |
|-----|-------------|-------|
| `@map-api` | All MAP API related tests | `npm run test:map-api` |
| `@flow-management` | Flow creation, update, delete tests | `npm run test:flow-management` |
| `@agent-management` | Agent creation, update, delete tests | `npm run test:agent-management` |
| `@error-handling` | Error validation and negative tests | `npm run test:error-handling` |
| `@dynamic-data` | Dynamic data generation tests | `npm run test:dynamic-data` |
| `@complete-workflow` | End-to-end workflow tests | `npm run test:complete-workflow` |

### **Project-Based Execution**

| Project | Description | Usage |
|---------|-------------|-------|
| `api-tests` | All API tests | `npm run test:api` |
| `smoke-tests` | Quick smoke tests | `npm run test:smoke` |
| `integration-tests` | Integration tests | `npm run test:integration` |
| `examples` | Example and demo tests | `npm run test:examples` |
| `gherkin-tests` | BDD/Gherkin tests | `npm run test:gherkin` |

## 🚀 **How to Run Specific APIs**

### **1. Run All MAP API Tests**
```bash
npm run test:map-api
```

### **2. Run Flow Management Tests Only**
```bash
npm run test:flow-management
```

### **3. Run Agent Management Tests Only**
```bash
npm run test:agent-management
```

### **4. Run Error Handling Tests Only**
```bash
npm run test:error-handling
```

### **5. Run Complete Workflow Tests**
```bash
npm run test:complete-workflow
```

### **6. Run Dynamic Data Tests**
```bash
npm run test:dynamic-data
```

## 🔧 **Advanced Tag Execution**

### **Run Multiple Tags**
```bash
# Run tests with both @map-api and @flow-management tags
npx playwright test --grep "@map-api|@flow-management"

# Run tests with @error-handling but exclude @dynamic-data
npx playwright test --grep "@error-handling" --grep-invert "@dynamic-data"
```

### **Run Specific Test Files**
```bash
# Run only the complete workflow example
npx playwright test tests/examples/map-api-complete-workflow.spec.ts

# Run all tests in examples folder
npx playwright test tests/examples/

# Run specific test by name
npx playwright test --grep "Complete MAP API Workflow"
```

### **Run Tests with Specific Project**
```bash
# Run only API tests
npx playwright test --project=api-tests

# Run only smoke tests
npx playwright test --project=smoke-tests

# Run only examples
npx playwright test --project=examples
```

## 📊 **Test Execution Examples**

### **Example 1: Run All Flow-Related Tests**
```bash
# This will run all tests tagged with @flow-management
npm run test:flow-management
```

### **Example 2: Run Error Handling Tests**
```bash
# This will run all tests tagged with @error-handling
npm run test:error-handling
```

### **Example 3: Run Complete Workflow**
```bash
# This will run the complete end-to-end workflow test
npm run test:complete-workflow
```

### **Example 4: Run Multiple Tag Combinations**
```bash
# Run tests that have both @map-api and @agent-management tags
npx playwright test --grep "@map-api.*@agent-management"
```

## 🎯 **Specific API Endpoint Testing**

### **Test Flow API Endpoints**
```bash
# Test flow creation, retrieval, and management
npm run test:flow-management
```

### **Test Agent API Endpoints**
```bash
# Test agent creation, retrieval, and management
npm run test:agent-management
```

### **Test Error Scenarios**
```bash
# Test invalid data and error handling
npm run test:error-handling
```

## 🔍 **Debugging and Development**

### **Run Tests in Debug Mode**
```bash
# Run specific test in debug mode
npx playwright test --debug --grep "Complete MAP API Workflow"

# Run with headed browser
npx playwright test --headed --grep "@map-api"
```

### **Run Tests with UI Mode**
```bash
# Open Playwright UI for interactive testing
npx playwright test --ui
```

### **Run Tests with Specific Browser**
```bash
# Run tests with specific browser
npx playwright test --project=api-tests --browser=chromium
```

## 📈 **Test Reporting**

### **Generate HTML Report**
```bash
# Run tests and generate HTML report
npx playwright test --reporter=html

# View the report
npm run test:report
```

### **Generate JSON Report**
```bash
# Generate JSON report for CI/CD
npx playwright test --reporter=json --output-file=test-results.json
```

## 🏃‍♂️ **Quick Start Commands**

### **For Development**
```bash
# Run all tests
npm test

# Run MAP API tests only
npm run test:map-api

# Run complete workflow
npm run test:complete-workflow
```

### **For CI/CD**
```bash
# Run smoke tests
npm run test:smoke

# Run API tests
npm run test:api

# Run integration tests
npm run test:integration
```

### **For Debugging**
```bash
# Debug specific test
npx playwright test --debug --grep "Complete MAP API Workflow"

# Run with UI
npx playwright test --ui
```

## 📝 **Adding New Tags**

To add new tags to your tests:

1. **Add tags to test descriptions**:
```typescript
test('My new test @new-tag @custom-tag', async () => {
  // Test implementation
});
```

2. **Add tags to test suites**:
```typescript
test.describe('My test suite @suite-tag', () => {
  // Tests here
});
```

3. **Add new script to package.json**:
```json
{
  "scripts": {
    "test:new-tag": "playwright test --grep @new-tag"
  }
}
```

## 🎯 **Best Practices**

### **1. Tag Naming**
- Use descriptive, meaningful tag names
- Use kebab-case for multi-word tags
- Group related functionality with consistent prefixes

### **2. Tag Organization**
- Use hierarchical tags: `@api`, `@api-flow`, `@api-flow-create`
- Use functional tags: `@smoke`, `@regression`, `@integration`
- Use feature tags: `@flow-management`, `@agent-management`

### **3. Execution Strategy**
- Use smoke tests for quick validation
- Use specific tags for focused testing
- Use project-based execution for different test types

---

**🎉 Happy Testing with Tag-Based Execution!**
