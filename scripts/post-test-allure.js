#!/usr/bin/env node

/**
 * Post-Test Allure Generator
 *
 * This script runs after test execution to generate Allure JSON files
 * from test results and serve the Allure report
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class PostTestAllureGenerator {
  constructor() {
    this.allureResultsDir = path.join(process.cwd(), "allure-results");
    this.reportsDir = path.join(process.cwd(), "reports");
    this.jsonDumpDir = path.join(process.cwd(), "jsonDumpRepository");
    this.allureReportDir = path.join(process.cwd(), "allure-report");
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: "✅",
        warn: "⚠️",
        error: "❌",
        success: "🎉",
      }[type] || "ℹ️";

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  ensureDirectories() {
    [this.allureResultsDir, this.reportsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    });
  }

  generateAllureFromDumps() {
    this.log("Generating Allure results from JSON dumps...");

    if (!fs.existsSync(this.jsonDumpDir)) {
      this.log("No JSON dump directory found", "warn");
      return false;
    }

    // Clear existing allure results first
    if (fs.existsSync(this.allureResultsDir)) {
      const existingFiles = fs
        .readdirSync(this.allureResultsDir)
        .filter((f) => f.endsWith(".json"));
      existingFiles.forEach((file) => {
        fs.unlinkSync(path.join(this.allureResultsDir, file));
      });
      this.log(`Cleared ${existingFiles.length} existing Allure result files`);
    }

    const dumpFiles = fs
      .readdirSync(this.jsonDumpDir)
      .filter((file) => file.endsWith(".json"))
      .sort((a, b) => {
        const timeA = this.extractTimestamp(a);
        const timeB = this.extractTimestamp(b);
        return timeB - timeA; // Latest first
      });

    if (dumpFiles.length === 0) {
      this.log("No JSON dump files found", "warn");
      return false;
    }

    this.log(`Found ${dumpFiles.length} JSON dump files`);

    // Get only the latest test execution dumps (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentDumps = dumpFiles.filter((file) => {
      const timestamp = this.extractTimestamp(file);
      return timestamp > fiveMinutesAgo;
    });

    this.log(
      `Using ${recentDumps.length} recent dump files from last 5 minutes`
    );

    // Generate Allure results from recent dumps only
    recentDumps.forEach((file, index) => {
      try {
        const dumpPath = path.join(this.jsonDumpDir, file);
        const dumpData = JSON.parse(fs.readFileSync(dumpPath, "utf8"));

        const allureResult = this.convertDumpToAllure(dumpData, index);
        const resultFileName = `${allureResult.uuid}-result.json`;
        const resultPath = path.join(this.allureResultsDir, resultFileName);

        fs.writeFileSync(resultPath, JSON.stringify(allureResult, null, 2));
        this.log(`Generated Allure result: ${resultFileName}`);
      } catch (error) {
        this.log(`Error processing ${file}: ${error.message}`, "error");
      }
    });

    return true;
  }

  extractTimestamp(filename) {
    const match = filename.match(/(\d{13})/);
    return match ? parseInt(match[1]) : 0;
  }

  convertDumpToAllure(dumpData, index) {
    const timestamp = Date.now();
    const testId = `api-test-${timestamp}-${index}`;

    // Extract test information from dump
    const request = dumpData.request || {};
    const response = dumpData.response || {};
    const environment = dumpData.environment || {};

    const method = request.method || "POST";
    const url = request.url || "Unknown URL";
    const statusCode = response.status || response.statusCode || 200;
    const isSuccess = statusCode >= 200 && statusCode < 300;

    // Determine test name from URL
    const testName = this.generateTestName(url, method);

    return {
      uuid: testId,
      name: testName,
      fullName: `API Testing: ${testName}`,
      description: `${method} request to ${url}`,
      labels: [
        { name: "suite", value: "API Testing" },
        { name: "testClass", value: "API Automation" },
        { name: "tag", value: "api" },
        { name: "severity", value: "normal" },
        { name: "story", value: testName },
      ],
      status: isSuccess ? "passed" : "failed",
      statusDetails: isSuccess
        ? {}
        : {
            message: `HTTP ${statusCode}`,
            trace: JSON.stringify(response.body || response.data, null, 2),
          },
      steps: [
        {
          name: "Prepare API request",
          status: "passed",
          start: timestamp - 1000,
          stop: timestamp - 800,
        },
        {
          name: `Execute ${method} request`,
          status: "passed",
          start: timestamp - 800,
          stop: timestamp - 200,
        },
        {
          name: "Validate response",
          status: isSuccess ? "passed" : "failed",
          start: timestamp - 200,
          stop: timestamp,
        },
      ],
      attachments: [
        {
          name: "Request Details",
          source: `request-${testId}.json`,
          type: "application/json",
        },
        {
          name: "Response Details",
          source: `response-${testId}.json`,
          type: "application/json",
        },
      ],
      parameters: [
        { name: "Method", value: method },
        { name: "URL", value: url },
        { name: "Status Code", value: statusCode.toString() },
        { name: "Environment", value: environment.setup || "Unknown" },
        { name: "Tenant", value: environment.tenant || "Unknown" },
      ],
      start: timestamp - 1000,
      stop: timestamp,
    };
  }

  generateTestName(url, method) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter((part) => part);
      const lastPart = pathParts[pathParts.length - 1] || "api";

      const action =
        method.toLowerCase() === "post"
          ? "Create"
          : method.toLowerCase() === "get"
          ? "Get"
          : method.toLowerCase() === "put"
          ? "Update"
          : method.toLowerCase() === "delete"
          ? "Delete"
          : "Execute";

      return `${action} ${
        lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
      }`;
    } catch (error) {
      return `${method} API Request`;
    }
  }

  generateCucumberJson() {
    this.log("Generating Cucumber JSON from dumps...");

    if (!fs.existsSync(this.jsonDumpDir)) {
      return false;
    }

    const dumpFiles = fs
      .readdirSync(this.jsonDumpDir)
      .filter((file) => file.endsWith(".json"))
      .sort((a, b) => this.extractTimestamp(b) - this.extractTimestamp(a));

    if (dumpFiles.length === 0) {
      return false;
    }

    const cucumberResults = [
      {
        name: "API Testing Feature",
        description: "Automated API testing results",
        elements: dumpFiles.slice(0, 10).map((file, index) => {
          try {
            const dumpData = JSON.parse(
              fs.readFileSync(path.join(this.jsonDumpDir, file), "utf8")
            );
            const request = dumpData.request || {};
            const response = dumpData.response || {};
            const statusCode = response.status || response.statusCode || 200;
            const isSuccess = statusCode >= 200 && statusCode < 300;

            return {
              name: this.generateTestName(
                request.url || "",
                request.method || "POST"
              ),
              type: "scenario",
              tags: [{ name: "@api" }, { name: "@automated" }],
              steps: [
                {
                  name: "Given I have a valid API endpoint",
                  result: { status: "passed" },
                },
                {
                  name: `When I submit a ${request.method || "POST"} request`,
                  result: { status: "passed" },
                },
                {
                  name: "Then I should receive a successful response",
                  result: { status: isSuccess ? "passed" : "failed" },
                },
              ],
            };
          } catch (error) {
            return {
              name: `Failed to parse ${file}`,
              type: "scenario",
              steps: [
                {
                  name: "Parse test data",
                  result: { status: "failed", error_message: error.message },
                },
              ],
            };
          }
        }),
      },
    ];

    const cucumberJsonPath = path.join(this.reportsDir, "cucumber.json");
    fs.writeFileSync(
      cucumberJsonPath,
      JSON.stringify(cucumberResults, null, 2)
    );
    this.log(`Generated Cucumber JSON: ${cucumberJsonPath}`);

    return true;
  }

  async run() {
    try {
      this.log("🚀 Starting post-test Allure generation...", "info");

      // Ensure directories exist
      this.ensureDirectories();

      // Generate Cucumber JSON from dumps
      const cucumberGenerated = this.generateCucumberJson();

      // Generate Allure results from dumps
      const allureGenerated = this.generateAllureFromDumps();

      if (!allureGenerated && !cucumberGenerated) {
        this.log("No test data found to generate reports", "warn");
        return false;
      }

      // Count generated files
      const allureFiles = fs
        .readdirSync(this.allureResultsDir)
        .filter((f) => f.endsWith(".json"));
      this.log(
        `Generated ${allureFiles.length} Allure result files`,
        "success"
      );

      this.log("✅ Post-test Allure generation completed!", "success");
      this.log('📊 Run "npm run allure:serve" to view the report', "info");

      return true;
    } catch (error) {
      this.log(`Error in post-test generation: ${error.message}`, "error");
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new PostTestAllureGenerator();
  generator.run().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = PostTestAllureGenerator;
