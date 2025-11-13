const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const mongoUri = process.env.MONGO_URI;
console.log('📦 Connecting to MongoDB:', mongoUri);

async function checkDatabase() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const WorkerUser = require('./models/WorkerUser.model');
    const Worker = require('./models/Worker.model');

    // Check WorkerUser collection
    const workerUsersCount = await WorkerUser.countDocuments();
    const workerUsers = await WorkerUser.find({}, '_id name email categories').limit(5);
    console.log(`📊 WorkerUser Collection (Total: ${workerUsersCount})`);
    if (workerUsers.length > 0) {
      workerUsers.forEach(w => console.log(`  - ${w._id} | ${w.name} | ${w.categories?.join(', ')}`));
    } else {
      console.log('  (empty)');
    }

    // Check Worker collection
    const workersCount = await Worker.countDocuments();
    const workers = await Worker.find({}, '_id userId categories').limit(5);
    console.log(`\n📊 Worker Collection (Total: ${workersCount})`);
    if (workers.length > 0) {
      workers.forEach(w => console.log(`  - ${w._id} | userId: ${w.userId} | ${w.categories?.join(', ')}`));
    } else {
      console.log('  (empty)');
    }

    console.log('\n⚠️  PROBLEM ANALYSIS:');
    console.log('  - WorkerSearch displays workers from WorkerUser collection');
    console.log('  - WorkerSearch passes worker._id (which is WorkerUser._id)');
    console.log('  - BookingPage calls /workers/:id which queries Worker collection');
    console.log('  - Worker collection has different _ids, so lookup fails!');
    
    console.log('\n✅ SOLUTION:');
    console.log('  Option 1: Use WorkerUser IDs in getWorkerById endpoint');
    console.log('  Option 2: Make WorkerSearch query Worker collection instead');
    console.log('  Option 3: Create mapping between Worker and WorkerUser collections');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
