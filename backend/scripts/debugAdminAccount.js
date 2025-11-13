// Comprehensive admin login test
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');

const debugAdminLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...\n');

    const email = 'admin@localworker.com';

    // Find admin
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      console.log('❌ Admin not found in database');
      process.exit(1);
    }

    console.log('📋 ADMIN ACCOUNT STATUS:');
    console.log('─'.repeat(50));
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Active:', admin.isActive);
    console.log('Login Attempts:', admin.loginAttempts);
    console.log('Account Locked:', admin.isLocked());
    console.log('Lock Until:', admin.lockUntil);
    console.log('Last Login:', admin.lastLogin);
    console.log('Password Hash exists:', !!admin.password);
    console.log('─'.repeat(50));

    // Check if locked
    if (admin.isLocked()) {
      console.log('\n🔒 ACCOUNT IS LOCKED!');
      console.log('Lock expires at:', admin.lockUntil);
      console.log('\nSolution: Resetting lockout...');
      
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();
      console.log('✅ Lockout cleared!');
    }

    if (!admin.isActive) {
      console.log('\n⚠️  ACCOUNT IS INACTIVE!');
      console.log('Activating account...');
      admin.isActive = true;
      await admin.save();
      console.log('✅ Account activated!');
    }

    // Test password
    console.log('\n🔐 TESTING PASSWORD:');
    console.log('─'.repeat(50));
    const testPassword = 'Admin@123';
    const isMatch = await admin.matchPassword(testPassword);
    console.log(`Password "${testPassword}": ${isMatch ? '✅ MATCHES' : '❌ DOES NOT MATCH'}`);
    console.log('─'.repeat(50));

    if (isMatch) {
      console.log('\n✅ ALL CHECKS PASSED! Login should work now.');
      console.log('\n📝 LOGIN CREDENTIALS:');
      console.log('  Email:', email);
      console.log('  Password:', testPassword);
      console.log('\n🌐 Try logging in at: http://localhost:5173/admin/login');
    } else {
      console.log('\n❌ PASSWORD MISMATCH! Admin account may be corrupted.');
      console.log('\nSolution: Reset admin account...');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

debugAdminLogin();
