require('dotenv').config();
const mongoose = require('mongoose');
const WorkerUser = require('../models/WorkerUser.model');

const checkWorkerIds = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    // Get all WorkerUser IDs and basic info
    const workers = await WorkerUser.find({})
      .select('_id name email role approvalStatus isActive')
      .lean();

    console.log('📋 WorkerUser Collection:');
    console.log('Total workers:', workers.length);
    console.log('\nWorker IDs and details:');
    workers.forEach((worker, index) => {
      console.log(`${index + 1}. ID: ${worker._id}`);
      console.log(`   Name: ${worker.name}`);
      console.log(`   Email: ${worker.email}`);
      console.log(`   Role: ${worker.role}`);
      console.log(`   Status: ${worker.approvalStatus}`);
      console.log(`   Active: ${worker.isActive}`);
      console.log('');
    });

    // Check for approved and active workers
    const approvedWorkers = workers.filter(w => w.approvalStatus === 'approved' && w.isActive);
    console.log(`✅ Approved & Active workers: ${approvedWorkers.length}`);

    mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkWorkerIds();
