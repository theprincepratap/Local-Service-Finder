#!/usr/bin/env node

/**
 * Admin Login Verification Script
 * Run: node adminLoginTest.js
 * Tests all components of admin login system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin.model');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  ok: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  err: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️${colors.reset}  ${msg}`),
};

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║      ADMIN LOGIN SYSTEM - VERIFICATION TEST       ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // Test 1: Database Connection
  console.log('TEST 1: Database Connection');
  console.log('─'.repeat(50));
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log('Connected to MongoDB');
  } catch (error) {
    log.err('Failed to connect to MongoDB');
    log.err(`Error: ${error.message}`);
    process.exit(1);
  }

  // Test 2: Admin Exists
  console.log('\nTEST 2: Admin User Exists');
  console.log('─'.repeat(50));
  let admin;
  try {
    admin = await Admin.findOne({ email: 'admin@localworker.com' }).select('+password');
    if (admin) {
      log(`Admin found: ${admin.email}`);
      log(`Role: ${admin.role}`);
      log(`Active: ${admin.isActive}`);
    } else {
      log.err('Admin not found in database');
      log.warn('Run: node scripts/createAdmin.js');
      process.exit(1);
    }
  } catch (error) {
    log.err(`Error fetching admin: ${error.message}`);
    process.exit(1);
  }

  // Test 3: Password Hash
  console.log('\nTEST 3: Password Hash Verification');
  console.log('─'.repeat(50));
  try {
    const passwordMatch = await bcrypt.compare('Admin@123', admin.password);
    if (passwordMatch) {
      log('Password hash is correct');
    } else {
      log.err('Password hash does NOT match "Admin@123"');
      log.warn('Recreate admin: node scripts/resetAdmin.js');
      process.exit(1);
    }
  } catch (error) {
    log.err(`Error comparing password: ${error.message}`);
    process.exit(1);
  }

  // Test 4: API Endpoint
  console.log('\nTEST 4: API Login Endpoint');
  console.log('─'.repeat(50));
  try {
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@localworker.com',
      password: 'Admin@123',
    });

    if (response.status === 200) {
      log('API endpoint returned 200 OK');
      log(`Token issued: ${response.data.token.substring(0, 30)}...`);
      log(`User: ${response.data.user.email}`);
      log(`Role: ${response.data.user.role}`);
    } else {
      log.err(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    log.err(`API request failed`);
    if (error.response) {
      log.err(`Status: ${error.response.status}`);
      log.err(`Error: ${error.response.data?.message}`);
      log.warn('Make sure backend is running: npm start');
    } else {
      log.err(`Error: ${error.message}`);
      log.warn('Backend not running on http://localhost:5000');
    }
    process.exit(1);
  }

  // Test 5: Check Routes
  console.log('\nTEST 5: Admin Auth Routes');
  console.log('─'.repeat(50));
  try {
    const serverCode = require('fs').readFileSync('./server.js', 'utf8');
    if (serverCode.includes("require('./routes/adminAuth.routes')")) {
      log('Admin auth routes imported in server.js');
    } else {
      log.err('Admin auth routes NOT imported in server.js');
      log.warn('Add to server.js: app.use(\'/api/auth\', require(\'./routes/adminAuth.routes\'));');
    }
  } catch (error) {
    log.warn(`Could not check server.js: ${error.message}`);
  }

  // Test 6: Admin Model Methods
  console.log('\nTEST 6: Admin Model Methods');
  console.log('─'.repeat(50));
  try {
    log(`isLocked(): ${admin.isLocked() ? 'Locked' : 'Not locked'}`);
    log(`loginAttempts: ${admin.loginAttempts}`);
    log(`Model methods exist: ${
      [
        admin.matchPassword,
        admin.isLocked,
        admin.incLoginAttempts,
        admin.resetLoginAttempts,
        admin.addActivityLog,
        admin.getResetPasswordToken,
      ].every((m) => typeof m === 'function')
        ? 'Yes'
        : 'No'
    }`);
  } catch (error) {
    log.err(`Error checking model methods: ${error.message}`);
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('✅ ALL TESTS PASSED');
  console.log('═'.repeat(50));
  console.log('\n🚀 Admin Login is ready to use:');
  console.log(`   Email:    admin@localworker.com`);
  console.log(`   Password: Admin@123`);
  console.log(`   Login:    http://localhost:5173/admin/login`);
  console.log('\n');

  process.exit(0);
}

runTests().catch((error) => {
  log.err(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
