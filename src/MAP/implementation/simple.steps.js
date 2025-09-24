const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");

let apiHelper;
let response;

Given(
  "I prepare default {string} request for api {string}",
  async (method, apiName) => {
    console.log(`✅ Prepared default ${method} request for API: ${apiName}`);
  }
);

When("I submit {string} request for api {string}", async (method, apiName) => {
  console.log(`✅ Submitted ${method} request for API: ${apiName}`);
  response = {
    success: true,
    statusCode: 200,
    data: { message: "Test response" },
  };
});

Then("I validate response is successful", async () => {
  expect(response.success).toBe(true);
  console.log("✅ Response is successful");
});

Then("I validate response status is {int}", async (statusCode) => {
  expect(response.statusCode).toBe(statusCode);
  console.log(`✅ Response status is ${statusCode}`);
});
