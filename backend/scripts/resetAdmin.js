// Script to delete existing admin and create new one
// Run: node backend/scripts/resetAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin.model');

const resetAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Delete all existing admin users
    const deleteResult = await Admin.deleteMany({ role: 'admin' });
    console.log(`Deleted ${deleteResult.deletedCount} admin user(s)`);

    // Admin user details
    const adminEmail = process.env.ADMIN_EMAIL || 'theprincepratap@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin.pwd@999';
    const adminName = process.env.ADMIN_NAME || 'Prince Kumar';
    const adminPhone = process.env.ADMIN_PHONE || '9999999999';

    // Create admin user (password will be hashed by pre-save hook)
    const adminUser = new Admin({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Don't hash here - let the model do it
      phone: adminPhone,
      role: 'admin',
      isActive: true,
      permissions: [
        'manage_users',
        'manage_workers',
        'manage_bookings',
        'manage_reviews',
        'manage_admins',
        'view_analytics',
        'manage_system_settings',
        'manage_categories',
        'manage_disputes',
        'view_reports'
      ]
    });

    await adminUser.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('==========================================');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Name:', adminName);
    console.log('Role:', 'admin');
    console.log('==========================================');
    console.log('\n⚠️  Please change the password after first login!\n');
    console.log('🔐 Admin Login: http://localhost:5173/admin/login');
    console.log('📊 Admin Dashboard: http://localhost:5173/admin/dashboard');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetAdminUser();
