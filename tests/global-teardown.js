"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function globalTeardown(config) {
    console.log('🧹 Starting API Automation Framework Global Teardown');
    // Generate test summary
    const fs = require('fs');
    const path = require('path');
    const resultsFile = path.join(process.cwd(), 'test-results', 'results.json');
    if (fs.existsSync(resultsFile)) {
        try {
            const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
            // Calculate summary statistics
            const totalTests = results.suites.reduce((sum, suite) => sum + suite.specs.length, 0);
            const passedTests = results.suites.reduce((sum, suite) => sum + suite.specs.filter((spec) => spec.ok).length, 0);
            const failedTests = totalTests - passedTests;
            const totalDuration = results.suites.reduce((sum, suite) => sum + suite.duration, 0);
            console.log('📊 Test Summary:');
            console.log(`   Total Tests: ${totalTests}`);
            console.log(`   Passed: ${passedTests}`);
            console.log(`   Failed: ${failedTests}`);
            console.log(`   Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0}%`);
            console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
            // Generate summary report
            const summaryReport = {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'test',
                summary: {
                    totalTests,
                    passedTests,
                    failedTests,
                    successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
                    totalDuration
                },
                configuration: {
                    baseUrl: process.env.BASE_URL,
                    nodeEnv: process.env.NODE_ENV,
                    hasApiKey: !!process.env.API_KEY,
                    hasChatApiUrl: !!process.env.CHAT_API_URL,
                    hasAblyApiKey: !!process.env.ABLY_API_KEY
                }
            };
            const summaryFile = path.join(process.cwd(), 'test-results', 'summary.json');
            fs.writeFileSync(summaryFile, JSON.stringify(summaryReport, null, 2));
            console.log('📄 Generated summary report: test-results/summary.json');
        }
        catch (error) {
            console.error('❌ Error processing test results:', error);
        }
    }
    // Clean up any temporary files with Windows permission handling
    const tempDir = path.join(process.cwd(), 'temp');
    try {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log('🗑️  Cleaned up temporary files');
        }
    }
    catch (error) {
        console.warn('⚠️  Could not clean up temporary files:', error.message);
    }
    // Clean up test-results directory with Windows permission handling
    const testResultsDir = path.join(process.cwd(), 'test-results');
    try {
        if (fs.existsSync(testResultsDir)) {
            // Don't remove the entire directory, just clean up specific files
            const files = fs.readdirSync(testResultsDir);
            for (const file of files) {
                const filePath = path.join(testResultsDir, file);
                try {
                    fs.unlinkSync(filePath);
                }
                catch (fileError) {
                    // Ignore individual file deletion errors
                }
            }
            console.log('🗑️  Cleaned up test results files');
        }
    }
    catch (error) {
        console.warn('⚠️  Could not clean up test results:', error.message);
    }
    console.log('✅ Global teardown completed successfully');
}
exports.default = globalTeardown;
