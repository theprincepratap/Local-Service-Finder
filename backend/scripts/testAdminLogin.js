// Test admin login
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin.model');

const testAdminLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...\n');

    const email = 'admin@localworker.com';
    const passwordToTest = 'Admin@123';

    console.log(`Testing login for: ${email}`);
    console.log(`Testing password: ${passwordToTest}\n`);

    // Find admin
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    console.log('Admin Details:');
    console.log('- Email:', admin.email);
    console.log('- Name:', admin.name);
    console.log('- Active:', admin.isActive);
    console.log('- Role:', admin.role);
    console.log('- Password Hash:', admin.password.substring(0, 30) + '...\n');

    // Try to match password
    console.log('Testing password match...');
    const isMatch = await admin.matchPassword(passwordToTest);
    
    if (isMatch) {
      console.log('✅ PASSWORD MATCHES! Login should work.');
    } else {
      console.log('❌ PASSWORD DOES NOT MATCH!');
      console.log('\nTrying other common passwords...');
      
      const commonPasswords = [
        'admin.pwd@999',
        'Admin123456',
        'admin123',
        'password',
        'Admin@123456'
      ];

      for (const pwd of commonPasswords) {
        const match = await admin.matchPassword(pwd);
        if (match) {
          console.log(`✅ CORRECT PASSWORD FOUND: "${pwd}"`);
          break;
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

testAdminLogin();
