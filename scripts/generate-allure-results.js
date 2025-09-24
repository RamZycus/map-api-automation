const fs = require('fs');
const path = require('path');

class AllureResultGenerator {
  constructor() {
    this.allureResultsDir = 'allure-results';
    this.jsonDumpDir = 'jsonDumpRepository';
    this.reportsDir = 'reports';
  }

  log(message) {
    console.log(`[Allure Generator] ${message}`);
  }

  ensureDirectories() {
    [this.allureResultsDir, this.reportsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${dir}`);
      }
    });
  }

  clearExistingResults() {
    if (fs.existsSync(this.allureResultsDir)) {
      const files = fs.readdirSync(this.allureResultsDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.allureResultsDir, file));
      });
      this.log(`Cleared ${files.length} existing result files`);
    }
  }

  generateAllureResult(dumpFile, index) {
    try {
      const dumpPath = path.join(this.jsonDumpDir, dumpFile);
      const dumpData = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
      
      const testResult = {
        uuid: this.generateUUID(),
        historyId: this.generateHistoryId(dumpData),
        fullName: this.generateTestName(dumpData),
        labels: [
          { name: 'framework', value: 'cucumber' },
          { name: 'language', value: 'javascript' },
          { name: 'package', value: 'api-testing' },
          { name: 'testClass', value: 'Flow Management' },
          { name: 'testMethod', value: this.generateTestName(dumpData) },
          { name: 'severity', value: 'normal' },
          { name: 'feature', value: 'Flow Management' },
          { name: 'story', value: 'Create Flow' }
        ],
        links: [],
        name: this.generateTestName(dumpData),
        status: dumpData.response.statusCode >= 200 && dumpData.response.statusCode < 300 ? 'passed' : 'failed',
        statusDetails: {
          message: dumpData.response.statusCode >= 200 && dumpData.response.statusCode < 300 ? 
            'Test passed successfully' : `HTTP ${dumpData.response.statusCode}`,
          trace: dumpData.response.statusCode >= 200 && dumpData.response.statusCode < 300 ? 
            null : `Response: ${JSON.stringify(dumpData.response.body, null, 2)}`
        },
        stage: 'finished',
        description: `API Test: ${dumpData.request.method} ${dumpData.request.url}`,
        descriptionHtml: this.generateDescriptionHtml(dumpData),
        steps: this.generateSteps(dumpData),
        attachments: this.generateAttachments(dumpData),
        parameters: this.generateParameters(dumpData),
        start: dumpData.timestamp - 1000,
        stop: dumpData.timestamp,
        duration: 1000
      };

      const resultFile = path.join(this.allureResultsDir, `${testResult.uuid}-result.json`);
      fs.writeFileSync(resultFile, JSON.stringify(testResult, null, 2));
      
      this.log(`Generated Allure result: ${testResult.name}`);
      return testResult;
    } catch (error) {
      this.log(`Error processing ${dumpFile}: ${error.message}`);
      return null;
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  generateHistoryId(dumpData) {
    return Buffer.from(`${dumpData.request.method}-${dumpData.request.url}`).toString('base64').substring(0, 16);
  }

  generateTestName(dumpData) {
    const url = dumpData.request.url;
    const method = dumpData.request.method;
    
    if (url.includes('/flows')) {
      return method === 'POST' ? 'Create Flow' : 
             method === 'GET' ? 'Get Flow' :
             method === 'PUT' ? 'Update Flow' : 'Delete Flow';
    }
    
    return `${method} ${url.split('/').pop()}`;
  }

  generateDescriptionHtml(dumpData) {
    return `
      <h3>API Request Details</h3>
      <p><strong>Method:</strong> ${dumpData.request.method}</p>
      <p><strong>URL:</strong> ${dumpData.request.url}</p>
      <p><strong>Status Code:</strong> ${dumpData.response.statusCode}</p>
      <h4>Request Payload:</h4>
      <pre>${JSON.stringify(dumpData.request.body, null, 2)}</pre>
      <h4>Response:</h4>
      <pre>${JSON.stringify(dumpData.response.body, null, 2)}</pre>
    `;
  }

  generateSteps(dumpData) {
    return [
      {
        name: `Execute ${dumpData.request.method} request`,
        status: dumpData.response.statusCode >= 200 && dumpData.response.statusCode < 300 ? 'passed' : 'failed',
        stage: 'finished',
        start: dumpData.timestamp - 500,
        stop: dumpData.timestamp,
        duration: 500,
        steps: []
      }
    ];
  }

  generateAttachments(dumpData) {
    return [
      {
        name: 'Request Details',
        type: 'application/json',
        source: Buffer.from(JSON.stringify(dumpData.request, null, 2)).toString('base64')
      },
      {
        name: 'Response Details', 
        type: 'application/json',
        source: Buffer.from(JSON.stringify(dumpData.response, null, 2)).toString('base64')
      }
    ];
  }

  generateParameters(dumpData) {
    return [
      { name: 'URL', value: dumpData.request.url },
      { name: 'Method', value: dumpData.request.method },
      { name: 'Status Code', value: dumpData.response.statusCode.toString() }
    ];
  }

  generateCucumberJson(dumpFiles) {
    const cucumberResults = {
      implementation: {
        name: 'cucumber-js',
        version: '9.0.0'
      },
      features: [
        {
          uri: 'src/MAP/features/flows/flow-management.feature',
          id: 'flow-management',
          keyword: 'Feature',
          name: 'Flow Management',
          description: 'As a QA Engineer\nI want to test Flow management operations\nSo that I can ensure proper functionality of Flow CRUD operations',
          line: 1,
          tags: [],
          elements: []
        }
      ]
    };

    dumpFiles.forEach((dumpFile, index) => {
      try {
        const dumpPath = path.join(this.jsonDumpDir, dumpFile);
        const dumpData = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
        
        const scenario = {
          id: `flow-management-${index}`,
          keyword: 'Scenario',
          name: this.generateTestName(dumpData),
          description: '',
          line: 10 + index,
          type: 'scenario',
          tags: [{ name: '@createFlow', line: 10 }],
          steps: [
            {
              keyword: 'Given ',
              name: 'I have a valid API endpoint',
              line: 7,
              match: { location: 'src/MAP/implementation/api-testing.steps.ts:10' },
              result: { status: 'passed', duration: 100000 }
            },
            {
              keyword: 'When ',
              name: 'I create a new flow',
              line: 13,
              match: { location: 'src/MAP/implementation/api-testing.steps.ts:20' },
              result: { 
                status: dumpData.response.statusCode >= 200 && dumpData.response.statusCode < 300 ? 'passed' : 'failed',
                duration: 500000
              }
            },
            {
              keyword: 'Then ',
              name: 'I validate flow response is successful',
              line: 14,
              match: { location: 'src/MAP/implementation/api-testing.steps.ts:30' },
              result: { 
                status: dumpData.response.statusCode >= 200 && dumpData.response.statusCode < 300 ? 'passed' : 'failed',
                duration: 200000
              }
            }
          ]
        };

        cucumberResults.features[0].elements.push(scenario);
      } catch (error) {
        this.log(`Error processing ${dumpFile} for Cucumber JSON: ${error.message}`);
      }
    });

    const cucumberJsonPath = path.join(this.reportsDir, 'cucumber.json');
    fs.writeFileSync(cucumberJsonPath, JSON.stringify(cucumberResults, null, 2));
    this.log(`Generated Cucumber JSON: ${cucumberJsonPath}`);
  }

  async generateResults() {
    this.log('Starting Allure result generation...');
    
    this.ensureDirectories();
    this.clearExistingResults();

    if (!fs.existsSync(this.jsonDumpDir)) {
      this.log(`JSON dump directory not found: ${this.jsonDumpDir}`);
      return;
    }

    const dumpFiles = fs.readdirSync(this.jsonDumpDir)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        const timestampA = this.extractTimestamp(a);
        const timestampB = this.extractTimestamp(b);
        return timestampB - timestampA; // Most recent first
      });

    if (dumpFiles.length === 0) {
      this.log('No JSON dump files found');
      return;
    }

    // Get only recent dumps (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentDumps = dumpFiles.filter(file => {
      const timestamp = this.extractTimestamp(file);
      return timestamp > fiveMinutesAgo;
    });

    this.log(`Processing ${recentDumps.length} recent dump files from last 5 minutes`);

    const results = [];
    recentDumps.forEach((dumpFile, index) => {
      const result = this.generateAllureResult(dumpFile, index);
      if (result) {
        results.push(result);
      }
    });

    // Generate Cucumber JSON for compatibility
    this.generateCucumberJson(recentDumps);

    this.log(`Generated ${results.length} Allure result files`);
    this.log('Allure result generation completed!');
  }

  extractTimestamp(filename) {
    const match = filename.match(/(\d{13})/);
    return match ? parseInt(match[1]) : 0;
  }
}

// Run the generator
const generator = new AllureResultGenerator();
generator.generateResults().catch(console.error);

