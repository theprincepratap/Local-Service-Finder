// Quick script to create an admin user
// Run: node backend/scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin.model');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Admin user details
    const adminEmail = process.env.ADMIN_EMAIL || 'theprincepratap@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin.pwd@999';
    const adminName = process.env.ADMIN_NAME || 'Prince Kumar';
    const adminPhone = process.env.ADMIN_PHONE || '9999999999';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save hook)
    const adminUser = new Admin({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
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
    console.log('Role:', 'admin');
    console.log('==========================================');
    console.log('\n⚠️  Please change the password after first login!');
    console.log('\n🔐 Admin Login: http://localhost:5173/admin/login');
    console.log('📊 Admin Dashboard: http://localhost:5173/admin/dashboard');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
