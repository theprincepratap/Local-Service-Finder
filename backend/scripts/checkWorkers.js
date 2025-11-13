// Check workers in database and their location data
require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('../models/Worker.model');
const User = require('../models/User.model');

const checkWorkers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...\n');

    // Get all workers
    const workers = await Worker.find().populate('userId', 'name email phone');
    
    console.log(`📊 Total Workers: ${workers.length}\n`);

    if (workers.length === 0) {
      console.log('❌ No workers found in database!');
      console.log('\n💡 Solution: You need to create some worker accounts first.');
      console.log('   - Register as a worker at: http://localhost:5173/worker/register');
      console.log('   - Or run a seed script to add sample workers\n');
      process.exit(0);
    }

    console.log('Workers with Location Data:\n');
    console.log('─'.repeat(80));

    let workersWithLocation = 0;
    let workersWithoutLocation = 0;

    workers.forEach((worker, index) => {
      const hasLocation = worker.location && 
                         worker.location.coordinates && 
                         worker.location.coordinates.length === 2 &&
                         worker.location.coordinates[0] !== 0 &&
                         worker.location.coordinates[1] !== 0;

      if (hasLocation) {
        workersWithLocation++;
        console.log(`${index + 1}. ✅ ${worker.userId?.name || 'N/A'}`);
        console.log(`   Email: ${worker.userId?.email || 'N/A'}`);
        console.log(`   Categories: ${worker.categories.join(', ')}`);
        console.log(`   Location: [${worker.location.coordinates[0]}, ${worker.location.coordinates[1]}]`);
        console.log(`   Address: ${worker.location.address || 'N/A'}`);
        console.log(`   Price: ₹${worker.pricePerHour}/hr`);
        console.log(`   Rating: ${worker.rating} (${worker.totalReviews} reviews)`);
        console.log(`   Status: ${worker.availability}`);
      } else {
        workersWithoutLocation++;
        console.log(`${index + 1}. ❌ ${worker.userId?.name || 'N/A'} - NO LOCATION DATA`);
        console.log(`   Email: ${worker.userId?.email || 'N/A'}`);
        console.log(`   Categories: ${worker.categories.join(', ')}`);
        console.log(`   Coordinates: ${JSON.stringify(worker.location?.coordinates || 'None')}`);
      }
      console.log('─'.repeat(80));
    });

    console.log('\n📈 Summary:');
    console.log(`   ✅ Workers with valid location: ${workersWithLocation}`);
    console.log(`   ❌ Workers without location: ${workersWithoutLocation}`);

    if (workersWithoutLocation > 0) {
      console.log('\n⚠️  Some workers don\'t have location data!');
      console.log('   This means they won\'t show up in location-based searches.');
      console.log('\n💡 Fix: Workers need to set their location during registration');
      console.log('   or update their profile with location coordinates.\n');
    }

    if (workersWithLocation === 0) {
      console.log('\n❌ No workers have location data!');
      console.log('   Location-based searches won\'t work.\n');
      console.log('💡 Quick Fix: Add sample workers with location data');
      console.log('   Run: node scripts/seedWorkersWithLocation.js\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkWorkers();
