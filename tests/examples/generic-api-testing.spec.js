"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const ApiHelper_1 = require("../../src/Framework/ApiHelper");
const JsonOperations_1 = require("../../src/Framework/JsonOperations");
test_1.test.describe('Generic API Testing Framework', () => {
    let apiHelper;
    let testContext;
    test_1.test.beforeEach(async ({ request }) => {
        apiHelper = new ApiHelper_1.ApiHelper(request);
        testContext = {};
    });
    (0, test_1.test)('Example: Test any API endpoint with generic framework', async () => {
        // Step 1: Load test data from JSON repository
        const userData = JsonOperations_1.JsonOperations.getTestData('users.validUser');
        console.log('Test data loaded:', userData);
        // Step 2: Test GET endpoint
        const getResponse = await apiHelper.get('/users');
        (0, test_1.expect)(getResponse.success).toBe(true);
        (0, test_1.expect)(getResponse.statusCode).toBe(200);
        console.log('GET response:', getResponse.data);
        // Step 3: Test POST endpoint
        const postResponse = await apiHelper.post('/users', userData);
        (0, test_1.expect)(postResponse.success).toBe(true);
        (0, test_1.expect)(postResponse.statusCode).toBe(201);
        console.log('POST response:', postResponse.data);
        // Store the created user ID for cleanup
        testContext.userId = postResponse.data.id;
        // Step 4: Test PUT endpoint
        const updatedUserData = JsonOperations_1.JsonOperations.getTestData('users.updatedUser');
        const putResponse = await apiHelper.put(`/users/${testContext.userId}`, updatedUserData);
        (0, test_1.expect)(putResponse.success).toBe(true);
        (0, test_1.expect)(putResponse.statusCode).toBe(200);
        console.log('PUT response:', putResponse.data);
        // Step 5: Test DELETE endpoint
        const deleteResponse = await apiHelper.delete(`/users/${testContext.userId}`);
        (0, test_1.expect)(deleteResponse.success).toBe(true);
        (0, test_1.expect)(deleteResponse.statusCode).toBe(200);
        console.log('DELETE response:', deleteResponse.data);
    });
    (0, test_1.test)('Example: Test API with different data types', async () => {
        // Test with product data
        const productData = JsonOperations_1.JsonOperations.getTestData('products.validProduct');
        const productResponse = await apiHelper.post('/products', productData);
        (0, test_1.expect)(productResponse.success).toBe(true);
        console.log('Product created:', productResponse.data);
        // Test with order data
        const orderData = JsonOperations_1.JsonOperations.getTestData('orders.validOrder');
        const orderResponse = await apiHelper.post('/orders', orderData);
        (0, test_1.expect)(orderResponse.success).toBe(true);
        console.log('Order created:', orderResponse.data);
    });
    (0, test_1.test)('Example: Test API error handling', async () => {
        // Test with invalid data
        const invalidUserData = JsonOperations_1.JsonOperations.getTestData('users.invalidUser');
        const errorResponse = await apiHelper.post('/users', invalidUserData);
        (0, test_1.expect)(errorResponse.success).toBe(false);
        (0, test_1.expect)(errorResponse.statusCode).toBe(400);
        console.log('Error response:', errorResponse.error);
    });
    (0, test_1.test)('Example: Test API with dynamic data', async () => {
        // Create dynamic test data
        const baseUserData = JsonOperations_1.JsonOperations.getTestData('users.validUser');
        const dynamicData = JsonOperations_1.JsonOperations.createDynamicTestData(baseUserData, {
            name: 'Dynamic User',
            email: 'dynamic@example.com'
        });
        const response = await apiHelper.post('/users', dynamicData);
        (0, test_1.expect)(response.success).toBe(true);
        (0, test_1.expect)(response.data.name).toBe('Dynamic User');
        console.log('Dynamic user created:', response.data);
    });
});
