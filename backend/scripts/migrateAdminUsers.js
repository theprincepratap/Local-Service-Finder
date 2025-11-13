// Script to migrate admin users from User collection to Admin collection
// Run: node backend/scripts/migrateAdminUsers.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');

const migrateAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB Connected...\n');

    // Find all admin users in User collection
    const adminUsers = await User.find({ role: 'admin' }).select('+password');
    
    if (adminUsers.length === 0) {
      console.log('ℹ️  No admin users found in User collection');
      process.exit(0);
    }

    console.log(`Found ${adminUsers.length} admin user(s) to migrate\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const adminUser of adminUsers) {
      try {
        // Check if admin already exists in Admin collection
        const existingAdmin = await Admin.findOne({ email: adminUser.email });
        
        if (existingAdmin) {
          console.log(`⏭️  Skipping ${adminUser.email} (already exists in Admin collection)`);
          skippedCount++;
          continue;
        }

        // Create new admin user
        const newAdmin = new Admin({
          name: adminUser.name,
          email: adminUser.email,
          password: adminUser.password, // Already hashed in User collection
          phone: adminUser.phone,
          role: 'admin',
          profileImage: adminUser.profileImage,
          isActive: adminUser.isActive,
          resetPasswordToken: adminUser.resetPasswordToken,
          resetPasswordExpire: adminUser.resetPasswordExpire,
          createdAt: adminUser.createdAt,
          updatedAt: adminUser.updatedAt,
          permissions: [
            'manage_users',
            'manage_workers',
            'manage_bookings',
            'manage_reviews',
            'view_analytics',
            'manage_disputes',
            'view_reports'
          ]
        });

        // We need to skip password hashing during save since it's already hashed
        // Set isModified to false to prevent double hashing
        newAdmin.isModified('password', false);
        await newAdmin.save({ validateBeforeSave: false });

        console.log(`✅ Migrated: ${adminUser.email}`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrating ${adminUser.email}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n==========================================');
    console.log(`✅ Migration Complete!`);
    console.log(`📊 Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log('==========================================');
    console.log('\n💡 Next Steps:');
    console.log('1. Verify admins in Admin collection: db.admins.find()');
    console.log('2. Remove admin users from User collection: db.users.deleteMany({ role: "admin" })');
    console.log('3. Update role enum in User model (remove "admin" option)');

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateAdminUsers();
