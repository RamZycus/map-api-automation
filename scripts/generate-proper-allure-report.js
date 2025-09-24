const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

class ProperAllureReportGenerator {
  constructor() {
    this.allureResultsDir = "allure-results";
    this.allureReportDir = "allure-report";
  }

  log(message) {
    console.log(`[Allure Report Generator] ${message}`);
  }

  ensureDirectories() {
    [this.allureResultsDir, this.allureReportDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    });
  }

  clearExistingReport() {
    if (fs.existsSync(this.allureReportDir)) {
      const files = fs.readdirSync(this.allureReportDir);
      files.forEach((file) => {
        const filePath = path.join(this.allureReportDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      });
      this.log(`Cleared existing report directory`);
    }
  }

  generateReportWithAllureCLI() {
    return new Promise((resolve, reject) => {
      this.log("Generating report using Allure CLI...");

      // Use the full path to avoid issues with spaces
      const projectPath = process.cwd();
      const allureCmd = `"${projectPath}\\node_modules\\.bin\\allure.cmd"`;
      const command = `${allureCmd} generate "${this.allureResultsDir}" --clean -o "${this.allureReportDir}"`;

      this.log(`Executing: ${command}`);

      exec(command, { cwd: projectPath }, (error, stdout, stderr) => {
        if (error) {
          this.log(`Error: ${error.message}`);
          this.log(`Stderr: ${stderr}`);
          reject(error);
          return;
        }

        this.log(`Allure CLI output: ${stdout}`);
        if (stderr) {
          this.log(`Allure CLI stderr: ${stderr}`);
        }

        resolve();
      });
    });
  }

  generateFallbackReport() {
    this.log("Generating fallback HTML report...");

    // Read Allure results
    const resultFiles = fs
      .readdirSync(this.allureResultsDir)
      .filter((file) => file.endsWith("-result.json"))
      .map((file) => {
        try {
          const content = fs.readFileSync(
            path.join(this.allureResultsDir, file),
            "utf8"
          );
          return JSON.parse(content);
        } catch (error) {
          this.log(`Error reading ${file}: ${error.message}`);
          return null;
        }
      })
      .filter((result) => result !== null);

    if (resultFiles.length === 0) {
      this.log("No result files found");
      return;
    }

    // Generate comprehensive HTML report
    const html = this.generateComprehensiveHtml(resultFiles);
    const indexPath = path.join(this.allureReportDir, "index.html");
    fs.writeFileSync(indexPath, html);

    // Generate data files for better structure
    this.generateDataFiles(resultFiles);

    this.log(`Fallback report generated: ${indexPath}`);
  }

  generateComprehensiveHtml(results) {
    const passedCount = results.filter((r) => r.status === "passed").length;
    const failedCount = results.filter((r) => r.status === "failed").length;
    const totalDuration = results.reduce(
      (sum, r) => sum + (r.duration || 0),
      0
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Allure Report - API Test Results</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 3em;
            font-weight: 300;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-number.passed { color: #28a745; }
        .stat-number.failed { color: #dc3545; }
        .stat-number.total { color: #007bff; }
        .stat-number.duration { color: #6f42c1; }
        .stat-label {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .test-results {
            padding: 30px;
        }
        .test-item {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .test-item:hover {
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        .test-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        .test-name {
            font-weight: 600;
            color: #495057;
            font-size: 1.1em;
        }
        .test-status {
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .test-details {
            padding: 20px;
            display: none;
            background: white;
        }
        .test-details.show {
            display: block;
        }
        .detail-section {
            margin-bottom: 20px;
        }
        .detail-section h4 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 5px;
        }
        .detail-content {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
            overflow-x: auto;
            border-left: 4px solid #007bff;
        }
        .toggle-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background 0.3s ease;
        }
        .toggle-btn:hover {
            background: #0056b3;
        }
        .no-results {
            text-align: center;
            padding: 60px;
            color: #6c757d;
        }
        .no-results h3 {
            font-size: 1.5em;
            margin-bottom: 10px;
        }
        .timestamp {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9em;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Allure Report</h1>
            <p>API Test Execution Results</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number total">${results.length}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat">
                <div class="stat-number passed">${passedCount}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat">
                <div class="stat-number failed">${failedCount}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat">
                <div class="stat-number duration">${Math.round(
                  totalDuration / 1000
                )}s</div>
                <div class="stat-label">Total Duration</div>
            </div>
        </div>
        
        <div class="test-results">
            ${
              results.length === 0
                ? '<div class="no-results"><h3>No test results found</h3><p>Run some tests to see results here.</p></div>'
                : results
                    .map((result) => this.generateTestItemHtml(result))
                    .join("")
            }
        </div>
        
        <div class="timestamp">
            Report generated at: ${new Date().toLocaleString()}
        </div>
    </div>

    <script>
        function toggleDetails(testId) {
            const details = document.getElementById('details-' + testId);
            const btn = document.getElementById('btn-' + testId);
            
            if (details.classList.contains('show')) {
                details.classList.remove('show');
                btn.textContent = 'Show Details';
            } else {
                details.classList.add('show');
                btn.textContent = 'Hide Details';
            }
        }
        
        // Auto-expand failed tests
        document.addEventListener('DOMContentLoaded', function() {
            const failedTests = document.querySelectorAll('.status-failed');
            failedTests.forEach(status => {
                const testItem = status.closest('.test-item');
                const testId = testItem.querySelector('[id^="btn-"]').id.replace('btn-', '');
                toggleDetails(testId);
            });
        });
    </script>
</body>
</html>`;
  }

  generateTestItemHtml(result) {
    const statusClass =
      result.status === "passed" ? "status-passed" : "status-failed";
    const statusText = result.status === "passed" ? "Passed" : "Failed";
    const testId = result.uuid || Math.random().toString(36).substr(2, 9);

    return `
      <div class="test-item">
        <div class="test-header" onclick="toggleDetails('${testId}')">
          <div class="test-name">${result.name || "Unnamed Test"}</div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <span class="test-status ${statusClass}">${statusText}</span>
            <button class="toggle-btn" id="btn-${testId}" onclick="event.stopPropagation(); toggleDetails('${testId}')">Show Details</button>
          </div>
        </div>
        <div class="test-details" id="details-${testId}">
          <div class="detail-section">
            <h4>Description</h4>
            <div class="detail-content">${
              result.description || "No description available"
            }</div>
          </div>
          ${
            result.parameters && result.parameters.length > 0
              ? `
          <div class="detail-section">
            <h4>Parameters</h4>
            <div class="detail-content">${JSON.stringify(
              result.parameters,
              null,
              2
            )}</div>
          </div>
          `
              : ""
          }
          ${
            result.statusDetails && result.statusDetails.message
              ? `
          <div class="detail-section">
            <h4>Status Details</h4>
            <div class="detail-content">${result.statusDetails.message}</div>
          </div>
          `
              : ""
          }
          ${
            result.steps && result.steps.length > 0
              ? `
          <div class="detail-section">
            <h4>Test Steps</h4>
            <div class="detail-content">${JSON.stringify(
              result.steps,
              null,
              2
            )}</div>
          </div>
          `
              : ""
          }
          ${
            result.attachments && result.attachments.length > 0
              ? `
          <div class="detail-section">
            <h4>Attachments</h4>
            <div class="detail-content">${result.attachments
              .map((att) => att.name)
              .join(", ")}</div>
          </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  generateDataFiles(results) {
    // Generate summary.json
    const summary = {
      generatedAt: new Date().toISOString(),
      totalTests: results.length,
      passedTests: results.filter((r) => r.status === "passed").length,
      failedTests: results.filter((r) => r.status === "failed").length,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
      results: results.map((r) => ({
        name: r.name,
        status: r.status,
        duration: r.duration,
        description: r.description,
        uuid: r.uuid,
      })),
    };

    const summaryPath = path.join(this.allureReportDir, "summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Generate data.json for better structure
    const dataPath = path.join(this.allureReportDir, "data.json");
    fs.writeFileSync(dataPath, JSON.stringify(results, null, 2));
  }

  async generateReport() {
    this.log("Starting proper Allure report generation...");

    this.ensureDirectories();
    this.clearExistingReport();

    // Check if we have result files
    if (!fs.existsSync(this.allureResultsDir)) {
      this.log(`Allure results directory not found: ${this.allureResultsDir}`);
      return;
    }

    const resultFiles = fs
      .readdirSync(this.allureResultsDir)
      .filter((file) => file.endsWith("-result.json"));

    if (resultFiles.length === 0) {
      this.log("No result files found");
      return;
    }

    this.log(`Found ${resultFiles.length} result files`);

    try {
      // Try to use Allure CLI first
      await this.generateReportWithAllureCLI();
      this.log("✅ Report generated successfully using Allure CLI");
    } catch (error) {
      this.log("⚠️ Allure CLI failed, generating fallback report");
      this.log(`Error: ${error.message}`);
      this.generateFallbackReport();
    }

    this.log("🎉 Report generation completed!");
    this.log(`📁 Report location: ${this.allureReportDir}`);
  }
}

// Run the generator
const generator = new ProperAllureReportGenerator();
generator.generateReport().catch(console.error);
