const fs = require('fs');
const path = require('path');

class SimpleAllureReportGenerator {
  constructor() {
    this.allureResultsDir = 'allure-results';
    this.allureReportDir = 'allure-report';
  }

  log(message) {
    console.log(`[Report Generator] ${message}`);
  }

  ensureDirectories() {
    if (!fs.existsSync(this.allureReportDir)) {
      fs.mkdirSync(this.allureReportDir, { recursive: true });
      this.log(`Created directory: ${this.allureReportDir}`);
    }
  }

  readAllureResults() {
    if (!fs.existsSync(this.allureResultsDir)) {
      this.log(`Allure results directory not found: ${this.allureResultsDir}`);
      return [];
    }

    const resultFiles = fs.readdirSync(this.allureResultsDir)
      .filter(file => file.endsWith('-result.json'))
      .map(file => {
        try {
          const content = fs.readFileSync(path.join(this.allureResultsDir, file), 'utf8');
          return JSON.parse(content);
        } catch (error) {
          this.log(`Error reading ${file}: ${error.message}`);
          return null;
        }
      })
      .filter(result => result !== null);

    this.log(`Read ${resultFiles.length} result files`);
    return resultFiles;
  }

  generateHtmlReport(results) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Allure Report - API Test Results</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #28a745;
        }
        .stat-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        .test-results {
            padding: 20px;
        }
        .test-item {
            border: 1px solid #e9ecef;
            border-radius: 6px;
            margin-bottom: 15px;
            overflow: hidden;
        }
        .test-header {
            padding: 15px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-name {
            font-weight: 600;
            color: #495057;
        }
        .test-status {
            padding: 4px 12px;
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
            padding: 15px;
            display: none;
        }
        .test-details.show {
            display: block;
        }
        .detail-section {
            margin-bottom: 15px;
        }
        .detail-section h4 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .detail-content {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .toggle-btn {
            background: none;
            border: none;
            color: #007bff;
            cursor: pointer;
            font-size: 0.9em;
        }
        .toggle-btn:hover {
            text-decoration: underline;
        }
        .no-results {
            text-align: center;
            padding: 40px;
            color: #6c757d;
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
                <div class="stat-number">${results.length}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat">
                <div class="stat-number">${results.filter(r => r.status === 'passed').length}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat">
                <div class="stat-number">${results.filter(r => r.status === 'failed').length}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat">
                <div class="stat-number">${Math.round(results.reduce((sum, r) => sum + (r.duration || 0), 0) / 1000)}s</div>
                <div class="stat-label">Total Duration</div>
            </div>
        </div>
        
        <div class="test-results">
            ${results.length === 0 ? 
              '<div class="no-results"><h3>No test results found</h3><p>Run some tests to see results here.</p></div>' :
              results.map(result => this.generateTestItemHtml(result)).join('')
            }
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
    </script>
</body>
</html>`;

    return html;
  }

  generateTestItemHtml(result) {
    const statusClass = result.status === 'passed' ? 'status-passed' : 'status-failed';
    const statusText = result.status === 'passed' ? 'Passed' : 'Failed';
    const testId = result.uuid || Math.random().toString(36).substr(2, 9);

    return `
      <div class="test-item">
        <div class="test-header">
          <div class="test-name">${result.name || 'Unnamed Test'}</div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <span class="test-status ${statusClass}">${statusText}</span>
            <button class="toggle-btn" id="btn-${testId}" onclick="toggleDetails('${testId}')">Show Details</button>
          </div>
        </div>
        <div class="test-details" id="details-${testId}">
          <div class="detail-section">
            <h4>Description</h4>
            <div class="detail-content">${result.description || 'No description available'}</div>
          </div>
          ${result.parameters && result.parameters.length > 0 ? `
          <div class="detail-section">
            <h4>Parameters</h4>
            <div class="detail-content">${JSON.stringify(result.parameters, null, 2)}</div>
          </div>
          ` : ''}
          ${result.statusDetails && result.statusDetails.message ? `
          <div class="detail-section">
            <h4>Status Details</h4>
            <div class="detail-content">${result.statusDetails.message}</div>
          </div>
          ` : ''}
          ${result.steps && result.steps.length > 0 ? `
          <div class="detail-section">
            <h4>Test Steps</h4>
            <div class="detail-content">${JSON.stringify(result.steps, null, 2)}</div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  async generateReport() {
    this.log('Starting HTML report generation...');
    
    this.ensureDirectories();
    const results = this.readAllureResults();
    
    if (results.length === 0) {
      this.log('No results found to generate report');
      return;
    }

    const html = this.generateHtmlReport(results);
    const reportPath = path.join(this.allureReportDir, 'index.html');
    
    fs.writeFileSync(reportPath, html);
    this.log(`HTML report generated: ${reportPath}`);
    
    // Also create a simple JSON summary
    const summary = {
      generatedAt: new Date().toISOString(),
      totalTests: results.length,
      passedTests: results.filter(r => r.status === 'passed').length,
      failedTests: results.filter(r => r.status === 'failed').length,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
      results: results.map(r => ({
        name: r.name,
        status: r.status,
        duration: r.duration,
        description: r.description
      }))
    };
    
    const summaryPath = path.join(this.allureReportDir, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    this.log(`Summary generated: ${summaryPath}`);
    
    this.log('Report generation completed!');
    this.log(`Open ${reportPath} in your browser to view the report`);
  }
}

// Run the generator
const generator = new SimpleAllureReportGenerator();
generator.generateReport().catch(console.error);

