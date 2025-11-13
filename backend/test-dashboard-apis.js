/**
 * Dashboard API Testing Script
 * Tests all 7 worker dashboard endpoints
 * Run: node test-dashboard-apis.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.yellow}${msg}${colors.reset}\n${colors.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`),
};

/**
 * Test endpoints
 */
const testEndpoints = async () => {
  log.header('WORKER DASHBOARD API TEST SUITE');

  const endpoints = [
    { method: 'GET', path: '/worker/dashboard/stats', name: 'Dashboard Stats' },
    { method: 'GET', path: '/worker/dashboard/pending-requests', name: 'Pending Requests' },
    { method: 'GET', path: '/worker/dashboard/schedule', name: "Today's Schedule" },
    { method: 'GET', path: '/worker/dashboard/active-jobs?page=1&limit=10', name: 'Active Jobs' },
    { method: 'GET', path: '/worker/dashboard/job-history?page=1&limit=10', name: 'Job History' },
    { method: 'GET', path: '/worker/dashboard/reviews?page=1&limit=10', name: 'Reviews' },
    { method: 'GET', path: '/worker/dashboard/earnings?period=month', name: 'Earnings Details' },
  ];

  for (const endpoint of endpoints) {
    log.test(`Testing: ${endpoint.method} ${endpoint.path}`);
    
    try {
      const response = await axios.get(`${API_URL}${endpoint.path}`);
      
      // Check response structure
      if (response.status === 200 && response.data) {
        log.success(`${endpoint.name}: Endpoint works`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response keys: ${Object.keys(response.data).join(', ')}`);
        
        // Show sample data if available
        if (response.data.data) {
          console.log(`   Data type: ${typeof response.data.data}`);
          if (Array.isArray(response.data.data)) {
            console.log(`   Items: ${response.data.data.length}`);
          }
        }
      } else {
        log.error(`${endpoint.name}: Unexpected response status ${response.status}`);
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 401) {
        log.error(`${endpoint.name}: Authentication required (401)`);
        console.log(`   💡 Hint: Need valid JWT token in Authorization header`);
      } else if (status === 404) {
        log.error(`${endpoint.name}: Route not found (404)`);
        console.log(`   💡 Hint: Check if routes are registered in server.js`);
      } else if (status === 500) {
        log.error(`${endpoint.name}: Server error (500)`);
        console.log(`   Message: ${message}`);
      } else {
        log.error(`${endpoint.name}: ${error.code || status || 'Unknown error'}`);
        console.log(`   Message: ${message}`);
      }
    }
    
    console.log('');
  }

  log.header('TEST SUMMARY');
  log.info('Notes:');
  console.log('  • Most endpoints require authentication (JWT token)');
  console.log('  • Use worker account to test protected endpoints');
  console.log('  • Database must have sample data to see real results');
  console.log('  • 401 errors are expected without valid JWT token');
  log.info(`\n📊 To get a valid token:\n   1. Register as a worker\n   2. Login to get JWT token\n   3. Add token to Authorization header\n`);
};

/**
 * Run tests
 */
const run = async () => {
  try {
    // Check if server is running
    log.info('Checking if server is running...');
    try {
      await axios.get(`${API_URL.replace('/api', '')}/health`, { timeout: 2000 });
      log.success('Server is running');
    } catch (e) {
      if (e.code === 'ECONNREFUSED') {
        log.error('Server is not running!');
        log.info('Start the server with: npm start');
        process.exit(1);
      }
    }

    // Run tests
    await testEndpoints();

    log.success('\n✨ Test complete!\n');
  } catch (error) {
    log.error('Test failed:', error.message);
    process.exit(1);
  }
};

run();
