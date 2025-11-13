require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

const debugAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...\n');

    const admin = await User.findOne({ email: 'theprincepratap@gmail.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('Email:', admin.email);
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Password hash:', admin.password);
    console.log('\n--- Testing password comparison ---');
    
    const testPassword = 'Admin123456';
    console.log('Testing password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log('Password matches:', isMatch);
    
    const isMatch2 = await admin.matchPassword(testPassword);
    console.log('matchPassword result:', isMatch2);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

debugAdmin();
