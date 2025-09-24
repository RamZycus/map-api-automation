#!/usr/bin/env node

/**
 * Simple Allure Report Generator
 *
 * This script creates a basic Allure report from Cucumber JSON results
 * Usage: node tools/generate-allure-report.js
 */

const fs = require("fs");
const path = require("path");

class AllureReportGenerator {
  constructor() {
    this.allureResultsDir = path.join(process.cwd(), "allure-results");
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    try {
      if (!fs.existsSync(this.allureResultsDir)) {
        fs.mkdirSync(this.allureResultsDir, { recursive: true });
      }
      console.log("✅ Allure results directory ready:", this.allureResultsDir);
    } catch (error) {
      console.error(
        "❌ Error creating allure-results directory:",
        error.message
      );
    }
  }

  async generateReport() {
    const jsonPath = path.join(process.cwd(), "reports", "cucumber.json");

    if (!fs.existsSync(jsonPath)) {
      console.error("❌ Cucumber JSON report not found at:", jsonPath);
      console.log("💡 Run tests first to generate JSON report");
      return false;
    }

    try {
      const cucumberResults = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      console.log("🔄 Generating Allure report from Cucumber results...");

      let testCount = 0;
      for (const feature of cucumberResults) {
        for (const element of feature.elements || []) {
          if (element.type === "scenario") {
            await this.createAllureTest(feature, element);
            testCount++;
          }
        }
      }

      console.log(`✅ Generated ${testCount} Allure test results`);
      console.log("📊 Results location: allure-results/");
      console.log("💡 To view report, run: npm run allure:serve");
      return true;
    } catch (error) {
      console.error("❌ Error generating Allure report:", error.message);
      return false;
    }
  }

  async createAllureTest(feature, scenario) {
    const testId = this.generateTestId(scenario.name);
    const allureTest = {
      uuid: testId,
      name: scenario.name,
      fullName: `${feature.name}: ${scenario.name}`,
      description: feature.description || "",
      labels: [
        { name: "suite", value: feature.name },
        { name: "testClass", value: feature.name },
        ...this.extractTags(scenario.tags || []).map((tag) => ({
          name: "tag",
          value: tag,
        })),
      ],
      status: this.getScenarioStatus(scenario),
      statusDetails: {},
      steps: this.processSteps(scenario.steps || []),
      start: Date.now(),
      stop: Date.now() + 1000,
    };

    try {
      const fileName = `${testId}-result.json`;
      const filePath = path.join(this.allureResultsDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(allureTest, null, 2));
    } catch (error) {
      console.error("Error writing test result:", error.message);
    }
  }

  processSteps(steps) {
    return steps.map((step, index) => ({
      name: step.name,
      status: this.getStepStatus(step.result?.status || "skipped"),
      start: Date.now() + index * 100,
      stop: Date.now() + (index + 1) * 100,
      statusDetails: step.result?.error_message
        ? {
            message: step.result.error_message,
            trace: step.result.error_message,
          }
        : {},
    }));
  }

  generateTestId(testName) {
    return (
      testName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now()
    );
  }

  extractTags(tags) {
    return tags.map((tag) => tag.name.replace("@", ""));
  }

  getScenarioStatus(scenario) {
    const steps = scenario.steps || [];
    const hasFailedSteps = steps.some(
      (step) => step.result && step.result.status === "failed"
    );

    if (hasFailedSteps) return "failed";

    const hasPassedSteps = steps.some(
      (step) => step.result && step.result.status === "passed"
    );

    if (hasPassedSteps) return "passed";

    return "skipped";
  }

  getStepStatus(status) {
    switch (status) {
      case "passed":
        return "passed";
      case "failed":
        return "failed";
      case "skipped":
        return "skipped";
      case "pending":
        return "skipped";
      default:
        return "broken";
    }
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new AllureReportGenerator();
  generator.generateReport().catch(console.error);
}

module.exports = AllureReportGenerator;
