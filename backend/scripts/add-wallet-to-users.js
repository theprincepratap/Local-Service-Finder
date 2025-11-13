/**
 * Migration Script: Add Wallet to Existing Users
 * This script adds the wallet field (₹50,000 default) to all existing users
 * Run this once after deploying the wallet feature
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import User model
const User = require('../models/User.model');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add wallet to existing users
const addWalletToUsers = async () => {
  try {
    console.log('\n🚀 Starting wallet migration...\n');

    // Find users without wallet field
    const usersWithoutWallet = await User.countDocuments({ 
      $or: [
        { wallet: { $exists: false } },
        { wallet: null }
      ]
    });

    console.log(`📊 Found ${usersWithoutWallet} users without wallet field`);

    if (usersWithoutWallet === 0) {
      console.log('✅ All users already have wallet field');
      return;
    }

    // Update all users without wallet
    const result = await User.updateMany(
      {
        $or: [
          { wallet: { $exists: false } },
          { wallet: null }
        ]
      },
      {
        $set: {
          wallet: 50000,
          walletHistory: []
        }
      }
    );

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   - Modified: ${result.modifiedCount} users`);
    console.log(`   - Matched: ${result.matchedCount} users`);
    console.log(`   - Default balance: ₹50,000`);

    // Verify the update
    const usersWithWallet = await User.countDocuments({ wallet: { $exists: true } });
    console.log(`\n📈 Total users with wallet: ${usersWithWallet}`);

    // Show sample users
    const sampleUsers = await User.find({ wallet: { $exists: true } })
      .select('name email wallet')
      .limit(5);
    
    console.log(`\n📋 Sample users with wallet:`);
    sampleUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ₹${user.wallet.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await addWalletToUsers();
    
    console.log('\n✅ Migration script completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
