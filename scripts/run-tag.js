#!/usr/bin/env node

const { execSync } = require('child_process');

// Get all arguments after the script name
const args = process.argv.slice(2);
const tag = args.join(' ');

if (!tag) {
  console.log('Usage: npm run test:tag <tag>');
  console.log('Example: npm run test:tag @testCreateFlow');
  console.log('Example: npm run test:tag @testCreateFlow @testCreateAgent');
  process.exit(1);
}

const command = `npx playwright test --project=gherkin-tests --grep "${tag}"`;
console.log(`Running: ${command}`);

try {
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
}
