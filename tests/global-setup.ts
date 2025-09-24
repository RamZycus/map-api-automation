import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting API Automation Framework Global Setup');
  
  // Set up environment variables
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  
  // Validate required environment variables
  const requiredEnvVars = ['BASE_URL', 'API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('⚠️  Some tests may fail without proper configuration');
  }
  
  // Log configuration
  console.log('📋 Configuration:');
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Base URL: ${process.env.BASE_URL || 'Not set'}`);
  console.log(`   API Key: ${process.env.API_KEY ? 'Set' : 'Not set'}`);
  console.log(`   Chat API URL: ${process.env.CHAT_API_URL || 'Not set'}`);
  console.log(`   Ably API Key: ${process.env.ABLY_API_KEY ? 'Set' : 'Not set'}`);
  
  // Create test results directory with Windows permission handling
  const fs = require('fs');
  const path = require('path');
  
  const testResultsDir = path.join(process.cwd(), 'test-results');
  try {
    if (fs.existsSync(testResultsDir)) {
      // Try to remove existing directory to avoid permission issues
      fs.rmSync(testResultsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testResultsDir, { recursive: true });
    console.log('📁 Created test-results directory');
  } catch (error) {
    console.warn('⚠️  Could not create test-results directory:', error.message);
    console.warn('⚠️  Tests will continue but may have permission issues');
  }
  
  // Create reports directory
  const reportsDir = path.join(process.cwd(), 'reports');
  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log('📁 Created reports directory');
    }
  } catch (error) {
    console.warn('⚠️  Could not create reports directory:', error.message);
  }
  
  console.log('✅ Global setup completed successfully');
}

export default globalSetup;
