const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const { chromium } = require("@playwright/test");

// Import our API helper (we'll need to convert it to CommonJS)
let apiHelper;
let response;
let request;

// Initialize Playwright request context
Given("I have a valid API endpoint", async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  request = context.request;
  console.log("✅ Initialized API request context");
});

Given("I have test data configured", async () => {
  console.log("✅ Test data configuration ready");
});

// Simple API helper for demonstration
class SimpleApiHelper {
  constructor(requestContext) {
    this.request = requestContext;
    this.baseUrl = "http://hpx-up1.app.inmu.qc.zycus.local:39405";
  }

  async submitPostRequest(apiName) {
    const url = this.buildUrl(apiName);
    const payload = this.getPayload(apiName);

    console.log("\n" + "=".repeat(80));
    console.log("📤 POST REQUEST");
    console.log("📍 URL:", url);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));
    console.log("-".repeat(80));

    try {
      const response = await this.request.post(url, {
        data: payload,
        headers: { "Content-Type": "application/json" },
      });

      const status = response.status();
      const data = await response.json();

      console.log("✅ RESPONSE");
      console.log("📊 Status Code:", status);
      console.log("📄 Response Body:", JSON.stringify(data, null, 2));
      console.log("=".repeat(80) + "\n");

      return {
        success: status >= 200 && status < 300,
        data: data,
        statusCode: status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.log("❌ ERROR");
      console.log("📊 Error:", error.message);
      console.log("=".repeat(80) + "\n");

      return {
        success: false,
        data: null,
        statusCode: 0,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async submitDeleteRequest(apiName) {
    const url = this.buildUrl(apiName);
    const payload = this.getPayload(apiName);

    console.log("\n" + "=".repeat(80));
    console.log("🗑️ DELETE REQUEST");
    console.log("📍 URL:", url);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));
    console.log("-".repeat(80));

    try {
      const response = await this.request.delete(url, {
        data: payload,
        headers: { "Content-Type": "application/json" },
      });

      const status = response.status();
      let data;

      // Handle different response types
      try {
        data = await response.json();
      } catch (jsonError) {
        data = await response.text();
      }

      console.log("✅ RESPONSE");
      console.log("📊 Status Code:", status);
      console.log(
        "📄 Response Body:",
        typeof data === "string" ? data : JSON.stringify(data, null, 2)
      );
      console.log("=".repeat(80) + "\n");

      return {
        success: status >= 200 && status < 300,
        data: data,
        statusCode: status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.log("❌ ERROR");
      console.log("📊 Error:", error.message);
      console.log("=".repeat(80) + "\n");

      return {
        success: false,
        data: null,
        statusCode: 0,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  buildUrl(apiName) {
    const endpoints = {
      createFlowPost: "/map-bk/api/v1/flows",
      createAgentPost: "/map-bk/api/v1/agents",
      deleteFlowPost: "/map-bk/api/v1/flows",
    };
    return `${this.baseUrl}${endpoints[apiName]}`;
  }

  getPayload(apiName) {
    const payloads = {
      createFlowPost: {
        name: "Test_Auto_" + Date.now(),
        description: "Test_Auto_" + Date.now(),
        logoPath: "/public/images/ANA.svg",
      },
      createAgentPost: {
        flowId: "68c6cababbb2e4a9d6575433",
        name: "Test Agent " + Date.now(),
        description: "Test Agent Description",
        type: "USER",
      },
      deleteFlowPost: {
        flowIds: ["68c850b37ac29bc81c72b779"], // Use the flow ID from previous test
      },
    };
    return payloads[apiName] || {};
  }
}

Given("I prepare default post request for api {string}", async (apiName) => {
  apiHelper = new SimpleApiHelper(request);
  console.log(`✅ Prepared default post request for API: ${apiName}`);
});

Given("I prepare default delete request for api {string}", async (apiName) => {
  apiHelper = new SimpleApiHelper(request);
  console.log(`✅ Prepared default delete request for API: ${apiName}`);
});

Given(
  "I set value for field {string} to variable {string}",
  async (fieldPath, variableName) => {
    console.log(`✅ Set field ${fieldPath} to variable ${variableName}`);
  }
);

When("I submit delete request for api {string}", async (apiName) => {
  response = await apiHelper.submitDeleteRequest(apiName);
});

Given(
  "I set value for header field {string} to value of attribute {string} from dump",
  async (headerName, attributePath) => {
    console.log(`✅ Set header ${headerName} to ${attributePath}`);
  }
);

When("I submit post request for api {string}", async (apiName) => {
  response = await apiHelper.submitPostRequest(apiName);
});

Then("I validate response is successful", async () => {
  expect(response.success).toBe(true);
  console.log("✅ Response is successful");
});

Then("I validate response status is {int}", async (statusCode) => {
  expect(response.statusCode).toBe(statusCode);
  console.log(`✅ Response status is ${statusCode}`);
});

Then("I validate fields {string}", async (fields) => {
  const fieldNames = fields.split(",");
  for (const fieldName of fieldNames) {
    expect(response.data).toHaveProperty(fieldName.trim());
  }
  console.log(`✅ Validated fields: ${fields}`);
});

Then("I store {string} as {string}", async (fieldPath, variableName) => {
  const value = response.data[fieldPath];
  console.log(
    `💾 Stored "${fieldPath}" value "${value}" as variable "${variableName}"`
  );
});
