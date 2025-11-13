const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const WorkerUser = mongoose.connection.collection('workerusers');
    
    // Get current indexes
    const indexes = await WorkerUser.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });
    
    // Drop all location-related 2dsphere indexes
    let droppedCount = 0;
    for (const index of indexes) {
      if (index.name !== '_id_' && (
        index.name.includes('location') || 
        index.name.includes('coordinates') ||
        index.name.includes('2dsphere') ||
        index.key['location.coordinates']
      )) {
        console.log(`\n🗑️ Dropping index: ${index.name}`);
        try {
          await WorkerUser.dropIndex(index.name);
          console.log(`✅ Dropped: ${index.name}`);
          droppedCount++;
        } catch (err) {
          console.log(`⚠️ Could not drop ${index.name}:`, err.message);
        }
      }
    }
    
    console.log(`\n✅ Cleanup complete! Dropped ${droppedCount} indexes`);
    console.log('ℹ️ Restart your backend to recreate proper indexes');
    console.log('   Run: npm run dev\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupIndexes();
