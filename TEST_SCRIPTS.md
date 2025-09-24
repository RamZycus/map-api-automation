# API Automation Framework - Test Scripts

This document describes the available test scripts and how to use them.

## Available Scripts

### Basic Test Execution
```bash
# Run all tests
npm test

# Run tests in headed mode (with browser UI)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui
```

### Test Categories
```bash
# Run only API tests
npx playwright test --project=api-tests

# Run only integration tests
npx playwright test --project=integration-tests

# Run only smoke tests
npx playwright test --project=smoke-tests
```

### Specific Test Files
```bash
# Run specific test file
npx playwright test tests/api/flow-crud.spec.ts

# Run tests matching a pattern
npx playwright test --grep "Flow CRUD"

# Run tests in a specific directory
npx playwright test tests/api/
```

### Test Reporting
```bash
# Show test report
npm run test:report

# Generate JSON report
npx playwright test --reporter=json

# Generate JUnit report
npx playwright test --reporter=junit
```

### Environment Configuration
```bash
# Run tests with specific environment
NODE_ENV=staging npm test

# Run tests with custom base URL
BASE_URL=https://staging-api.example.com npm test

# Run tests with custom timeout
npx playwright test --timeout=60000
```

### Parallel Execution
```bash
# Run tests in parallel (default)
npx playwright test

# Run tests sequentially
npx playwright test --workers=1

# Run with specific number of workers
npx playwright test --workers=4
```

### Test Filtering
```bash
# Run only failed tests from last run
npx playwright test --last-failed

# Run tests with specific tags
npx playwright test --grep "@smoke"

# Run tests excluding specific patterns
npx playwright test --grep-invert "slow"
```

### Debugging
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test tests/api/flow-crud.spec.ts --debug

# Run tests with trace
npx playwright test --trace=on
```

### CI/CD Integration
```bash
# Run tests for CI (with retries and proper reporting)
npx playwright test --reporter=html,junit,json

# Run tests with specific configuration
npx playwright test --config=playwright.config.ts --project=api-tests
```

## Test Configuration

### Environment Variables
- `BASE_URL`: Base URL for the API
- `API_KEY`: API authentication key
- `CHAT_API_URL`: Chat API endpoint URL
- `ABLY_API_KEY`: Ably API key for real-time messaging
- `ABLY_CHANNEL`: Ably channel name
- `NODE_ENV`: Environment (development, staging, production)

### Test Timeouts
- Default test timeout: 30 seconds
- Integration test timeout: 60 seconds
- Smoke test timeout: 15 seconds
- Assertion timeout: 10 seconds

### Retry Configuration
- CI: 2 retries
- Local: 0 retries
- Retry only on first failure

## Test Structure

### Test Categories
1. **API Tests** (`tests/api/`): Individual API endpoint tests
2. **Integration Tests** (`tests/integration/`): End-to-end workflow tests
3. **Smoke Tests** (`tests/smoke/`): Basic functionality verification

### Test Files
- `flow-crud.spec.ts`: Flow CRUD operations
- `agent-crud.spec.ts`: Agent CRUD operations
- `deployment.spec.ts`: Deployment and promotion
- `chat-api.spec.ts`: Chat API and Ably integration
- `complete-flow.spec.ts`: Complete workflow integration
- `data-variations.spec.ts`: Data variation testing
- `api-smoke.spec.ts`: Basic API smoke tests

## Best Practices

### Running Tests
1. Always run smoke tests first to verify basic functionality
2. Use integration tests for end-to-end validation
3. Run API tests for detailed endpoint validation
4. Use appropriate timeouts for different test types

### Debugging
1. Use debug mode for step-by-step execution
2. Enable trace for detailed execution information
3. Use headed mode to see browser interactions
4. Check test reports for detailed failure information

### CI/CD
1. Use appropriate reporters for your CI system
2. Set proper environment variables
3. Use retry configuration for flaky tests
4. Generate multiple report formats for different tools

## Troubleshooting

### Common Issues
1. **Timeout errors**: Increase timeout or check API responsiveness
2. **Authentication errors**: Verify API_KEY environment variable
3. **Network errors**: Check BASE_URL and network connectivity
4. **Test failures**: Check test reports for detailed error information

### Debug Steps
1. Run tests in debug mode
2. Check environment variables
3. Verify API endpoints are accessible
4. Review test reports and logs
5. Use trace mode for detailed execution information
