import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../src/Framework/ApiHelper';
import { JsonOperations } from '../../src/Framework/JsonOperations';

test.describe('Generic API Testing Framework', () => {
  let apiHelper: ApiHelper;
  let testContext: any;

  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
    testContext = {};
  });

  test('Example: Test any API endpoint with generic framework', async () => {
    // Step 1: Load test data from JSON repository
    const userData = JsonOperations.getTestData('users.validUser');
    console.log('Test data loaded:', userData);

    // Step 2: Test GET endpoint
    const getResponse = await apiHelper.get('/users');
    expect(getResponse.success).toBe(true);
    expect(getResponse.statusCode).toBe(200);
    console.log('GET response:', getResponse.data);

    // Step 3: Test POST endpoint
    const postResponse = await apiHelper.post('/users', userData);
    expect(postResponse.success).toBe(true);
    expect(postResponse.statusCode).toBe(201);
    console.log('POST response:', postResponse.data);

    // Store the created user ID for cleanup
    testContext.userId = postResponse.data.id;

    // Step 4: Test PUT endpoint
    const updatedUserData = JsonOperations.getTestData('users.updatedUser');
    const putResponse = await apiHelper.put(`/users/${testContext.userId}`, updatedUserData);
    expect(putResponse.success).toBe(true);
    expect(putResponse.statusCode).toBe(200);
    console.log('PUT response:', putResponse.data);

    // Step 5: Test DELETE endpoint
    const deleteResponse = await apiHelper.delete(`/users/${testContext.userId}`);
    expect(deleteResponse.success).toBe(true);
    expect(deleteResponse.statusCode).toBe(200);
    console.log('DELETE response:', deleteResponse.data);
  });

  test('Example: Test API with different data types', async () => {
    // Test with product data
    const productData = JsonOperations.getTestData('products.validProduct');
    const productResponse = await apiHelper.post('/products', productData);
    expect(productResponse.success).toBe(true);
    console.log('Product created:', productResponse.data);

    // Test with order data
    const orderData = JsonOperations.getTestData('orders.validOrder');
    const orderResponse = await apiHelper.post('/orders', orderData);
    expect(orderResponse.success).toBe(true);
    console.log('Order created:', orderResponse.data);
  });

  test('Example: Test API error handling', async () => {
    // Test with invalid data
    const invalidUserData = JsonOperations.getTestData('users.invalidUser');
    const errorResponse = await apiHelper.post('/users', invalidUserData);
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.statusCode).toBe(400);
    console.log('Error response:', errorResponse.error);
  });

  test('Example: Test API with dynamic data', async () => {
    // Create dynamic test data
    const baseUserData = JsonOperations.getTestData('users.validUser');
    const dynamicData = JsonOperations.createDynamicTestData(baseUserData, {
      name: 'Dynamic User',
      email: 'dynamic@example.com'
    });

    const response = await apiHelper.post('/users', dynamicData);
    expect(response.success).toBe(true);
    expect(response.data.name).toBe('Dynamic User');
    console.log('Dynamic user created:', response.data);
  });
});
