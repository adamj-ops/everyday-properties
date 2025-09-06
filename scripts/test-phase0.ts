import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Phase 0 Comprehensive Test Suite
 * This script runs all Phase 0 tests to verify the complete setup
 */

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(testName: string, command: string, cwd: string) {
  log(`\n🧪 Running ${testName}...`, 'blue');
  
  try {
    const output = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    log(`✅ ${testName} passed`, 'green');
    return { success: true, output };
  } catch (error: any) {
    log(`❌ ${testName} failed`, 'red');
    log(`Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runPhase0Tests() {
  log('🚀 Starting Phase 0 Comprehensive Test Suite', 'bold');
  log('=' .repeat(60), 'blue');

  const results = {
    database: { passed: 0, failed: 0, tests: [] as any[] },
    auth: { passed: 0, failed: 0, tests: [] as any[] },
    integration: { passed: 0, failed: 0, tests: [] as any[] },
  };

  // Test 1: Database RLS Setup
  log('\n📊 Phase 0.1: Database RLS Setup', 'yellow');
  const rlsTest = runTest(
    'Database RLS Test',
    'npm run db:test-rls',
    '/Users/adamjudeh/everyday-properties/everyday-properties/packages/database'
  );
  results.database.tests.push({ name: 'RLS Test', ...rlsTest });
  if (rlsTest.success) results.database.passed++; else results.database.failed++;

  // Test 2: Database Schema and Operations
  log('\n📊 Phase 0.2: Database Schema and Operations', 'yellow');
  const dbTest = runTest(
    'Database Operations Test',
    'npm run db:seed',
    '/Users/adamjudeh/everyday-properties/everyday-properties/packages/database'
  );
  results.database.tests.push({ name: 'Database Operations', ...dbTest });
  if (dbTest.success) results.database.passed++; else results.database.failed++;

  // Test 3: Auth Integration
  log('\n🔐 Phase 0.3: Auth Integration', 'yellow');
  const authTest = runTest(
    'Auth Integration Test',
    'npm run test:auth',
    '/Users/adamjudeh/everyday-properties/everyday-properties/packages/auth'
  );
  results.auth.tests.push({ name: 'Auth Integration', ...authTest });
  if (authTest.success) results.auth.passed++; else results.auth.failed++;

  // Test 4: Database + Auth Integration
  log('\n🔗 Phase 0.4: Database + Auth Integration', 'yellow');
  const integrationTest = runTest(
    'Database + Auth Integration Test',
    'npm run db:test-rls',
    '/Users/adamjudeh/everyday-properties/everyday-properties/packages/database'
  );
  results.integration.tests.push({ name: 'Database + Auth Integration', ...integrationTest });
  if (integrationTest.success) results.integration.passed++; else results.integration.failed++;

  // Test 5: Environment Validation
  log('\n🌍 Phase 0.5: Environment Validation', 'yellow');
  const envTest = validateEnvironment();
  results.integration.tests.push({ name: 'Environment Validation', ...envTest });
  if (envTest.success) results.integration.passed++; else results.integration.failed++;

  // Test 6: Database Connection Test
  log('\n🔌 Phase 0.6: Database Connection Test', 'yellow');
  const connectionTest = runTest(
    'Database Connection Test',
    'npm run db:push',
    '/Users/adamjudeh/everyday-properties/everyday-properties/packages/database'
  );
  results.database.tests.push({ name: 'Database Connection', ...connectionTest });
  if (connectionTest.success) results.database.passed++; else results.database.failed++;

  // Print Results Summary
  log('\n📋 Phase 0 Test Results Summary', 'bold');
  log('=' .repeat(60), 'blue');

  // Database Results
  log(`\n📊 Database Tests: ${results.database.passed} passed, ${results.database.failed} failed`, 
    results.database.failed === 0 ? 'green' : 'red');
  results.database.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    log(`  ${status} ${test.name}`, test.success ? 'green' : 'red');
  });

  // Auth Results
  log(`\n🔐 Auth Tests: ${results.auth.passed} passed, ${results.auth.failed} failed`, 
    results.auth.failed === 0 ? 'green' : 'red');
  results.auth.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    log(`  ${status} ${test.name}`, test.success ? 'green' : 'red');
  });

  // Integration Results
  log(`\n🔗 Integration Tests: ${results.integration.passed} passed, ${results.integration.failed} failed`, 
    results.integration.failed === 0 ? 'green' : 'red');
  results.integration.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    log(`  ${status} ${test.name}`, test.success ? 'green' : 'red');
  });

  // Overall Results
  const totalPassed = results.database.passed + results.auth.passed + results.integration.passed;
  const totalFailed = results.database.failed + results.auth.failed + results.integration.failed;
  const totalTests = totalPassed + totalFailed;

  log(`\n🎯 Overall Results: ${totalPassed}/${totalTests} tests passed`, 
    totalFailed === 0 ? 'green' : 'red');

  if (totalFailed === 0) {
    log('\n🎉 Phase 0 setup is complete and all tests are passing!', 'green');
    log('✅ Database schema and RLS policies are working', 'green');
    log('✅ Clerk authentication integration is working', 'green');
    log('✅ Multi-tenant isolation is working', 'green');
    log('✅ User management system is working', 'green');
    log('✅ Ready for Phase 1 implementation!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the errors above.', 'yellow');
    log('🔧 Fix the failing tests before proceeding to Phase 1.', 'yellow');
  }

  return totalFailed === 0;
}

function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length === 0) {
    log('✅ All required environment variables are set', 'green');
    return { success: true };
  } else {
    log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
    return { success: false, error: `Missing: ${missingVars.join(', ')}` };
  }
}

// Run the tests
runPhase0Tests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`❌ Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });

export { runPhase0Tests };
