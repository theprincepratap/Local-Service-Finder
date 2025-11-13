const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing Local MongoDB Connection...\n');
console.log('📝 Using connection string:', process.env.MONGO_URI);
console.log('');

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Connection Details:');
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Database:', mongoose.connection.name);
    console.log('   - Port:', mongoose.connection.port);
    console.log('   - Ready State:', mongoose.connection.readyState);
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    // Try to count documents in key collections
    if (collections.length > 0) {
      console.log('\n📊 Document counts:');
      for (const col of collections) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} documents`);
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting steps:');
    console.error('   1. Make sure MongoDB is installed and running locally');
    console.error('   2. Check if MongoDB service is started:');
    console.error('      - Windows: Run "net start MongoDB" in admin PowerShell');
    console.error('      - Or check Services app for "MongoDB" service');
    console.error('   3. Try connecting with MongoDB Compass to: mongodb://localhost:27017');
    console.error('   4. If MongoDB is not installed, download from: https://www.mongodb.com/try/download/community');
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
