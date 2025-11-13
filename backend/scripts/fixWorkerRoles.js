/**
 * FIX WORKER ROLES IN USER DATABASE
 * Changes all users with role='worker' to role='user'
 * Only admin should have role='admin'
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');

async function fixWorkerRoles() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    console.log('🔍 Finding all users with role="worker"...\n');
    
    // Find all users with worker role
    const workerRoleUsers = await User.find({ role: 'worker' });
    console.log(`📊 Found ${workerRoleUsers.length} users with role="worker"\n`);

    if (workerRoleUsers.length === 0) {
      console.log('✅ No users to fix!\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('🔧 Updating roles from "worker" to "user"...\n');
    console.log('─'.repeat(70));

    let updated = 0;
    let failed = 0;

    for (const user of workerRoleUsers) {
      try {
        const oldRole = user.role;
        user.role = 'user';
        await user.save();
        
        updated++;
        console.log(`✅ ${updated}. ${user.name} (${user.email})`);
        console.log(`   Changed: ${oldRole} → user`);
        
      } catch (err) {
        failed++;
        console.error(`❌ Failed to update ${user.email}:`, err.message);
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(70));
    console.log(`✅ Successfully Updated: ${updated} users`);
    console.log(`❌ Failed: ${failed} users`);
    console.log('═'.repeat(70));

    // Show current role distribution
    console.log('\n📈 CURRENT ROLE DISTRIBUTION:\n');
    
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    roleStats.forEach(stat => {
      console.log(`   ${stat._id.padEnd(10)} : ${stat.count} users`);
    });

    console.log('\n✅ Role correction completed successfully!\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 FIXING WORKER ROLES IN USER DATABASE\n');
console.log('This will change all role="worker" to role="user"\n');
fixWorkerRoles();
