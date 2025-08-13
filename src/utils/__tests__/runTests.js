#!/usr/bin/env node

/**
 * Simple test runner for Hugging Face Service tests
 * This script can be used to run specific test scenarios
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Running Hugging Face Service Tests...\n');

try {
  // Run the specific test file
  const testPath = join(__dirname, 'huggingFaceService.test.js');
  
  console.log('📁 Test file:', testPath);
  console.log('🚀 Starting tests...\n');
  
  // Run tests with vitest
  execSync('npx vitest run src/utils/__tests__/huggingFaceService.test.js', {
    stdio: 'inherit',
    cwd: join(__dirname, '../../../..')
  });
  
  console.log('\n✅ All tests completed successfully!');
  
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}
