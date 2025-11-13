// Seed sample workers with location data for testing
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Worker = require('../models/Worker.model');

const sampleWorkers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.plumber@test.com',
    phone: '9876543210',
    password: 'Worker@123',
    category: 'Plumber',
    skills: ['Plumbing', 'Pipe Repair', 'Leak Fixing', 'Bathroom Fitting'],
    experience: 5,
    pricePerHour: 350,
    location: {
      coordinates: [77.5946, 12.9716], // Bangalore
      address: 'Koramangala, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  },
  {
    name: 'Amit Sharma',
    email: 'amit.electrician@test.com',
    phone: '9876543211',
    password: 'Worker@123',
    category: 'Electrician',
    skills: ['Electrical Wiring', 'AC Installation', 'Fan Repair', 'Switch Board'],
    experience: 7,
    pricePerHour: 400,
    location: {
      coordinates: [77.6033, 12.9698], // Bangalore (Indiranagar)
      address: 'Indiranagar, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  },
  {
    name: 'Suresh Reddy',
    email: 'suresh.carpenter@test.com',
    phone: '9876543212',
    password: 'Worker@123',
    category: 'Carpenter',
    skills: ['Wood Work', 'Furniture Making', 'Door Repair', 'Cabinet Installation'],
    experience: 8,
    pricePerHour: 380,
    location: {
      coordinates: [77.5847, 12.9634], // Bangalore (HSR Layout)
      address: 'HSR Layout, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.painter@test.com',
    phone: '9876543213',
    password: 'Worker@123',
    category: 'Painter',
    skills: ['Wall Painting', 'Interior Design', 'Texture Painting', 'Waterproofing'],
    experience: 6,
    pricePerHour: 320,
    location: {
      coordinates: [77.6408, 12.9899], // Bangalore (Whitefield)
      address: 'Whitefield, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  },
  {
    name: 'Prakash Rao',
    email: 'prakash.cleaner@test.com',
    phone: '9876543214',
    password: 'Worker@123',
    category: 'Cleaner',
    skills: ['Deep Cleaning', 'House Cleaning', 'Office Cleaning', 'Sanitization'],
    experience: 3,
    pricePerHour: 250,
    location: {
      coordinates: [77.5713, 12.9352], // Bangalore (Jayanagar)
      address: 'Jayanagar, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  },
  {
    name: 'Ramesh Kumar',
    email: 'ramesh.acrepair@test.com',
    phone: '9876543215',
    password: 'Worker@123',
    category: 'AC Repair',
    skills: ['AC Installation', 'AC Servicing', 'Gas Refilling', 'AC Repair'],
    experience: 9,
    pricePerHour: 450,
    location: {
      coordinates: [77.5945, 12.9352], // Bangalore (BTM Layout)
      address: 'BTM Layout, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  },
  {
    name: 'Manoj Verma',
    email: 'manoj.plumber@test.com',
    phone: '9876543216',
    password: 'Worker@123',
    category: 'Plumber',
    skills: ['Plumbing', 'Drainage', 'Water Tank Cleaning', 'Pipeline Installation'],
    experience: 4,
    pricePerHour: 300,
    location: {
      coordinates: [77.6109, 12.9611], // Bangalore (Marathahalli)
      address: 'Marathahalli, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  },
  {
    name: 'Satish Patel',
    email: 'satish.electrician@test.com',
    phone: '9876543217',
    password: 'Worker@123',
    category: 'Electrician',
    skills: ['Electrical Work', 'Inverter Installation', 'Solar Panel', 'Home Automation'],
    experience: 10,
    pricePerHour: 500,
    location: {
      coordinates: [77.5835, 12.9784], // Bangalore (Malleshwaram)
      address: 'Malleshwaram, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka'
    }
  }
];

const seedWorkers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...\n');
    console.log('🌱 Seeding sample workers...\n');

    let created = 0;
    let skipped = 0;

    for (const workerData of sampleWorkers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: workerData.email });
      
      if (existingUser) {
        console.log(`⏭️  Skipped: ${workerData.name} (already exists)`);
        skipped++;
        continue;
      }

      // Create user account
      const user = await User.create({
        name: workerData.name,
        email: workerData.email,
        phone: workerData.phone,
        password: workerData.password,
        role: 'worker',
        location: {
          type: 'Point',
          coordinates: workerData.location.coordinates,
          address: workerData.location.address,
          city: workerData.location.city,
          state: workerData.location.state
        }
      });

      // Create worker profile
      await Worker.create({
        userId: user._id,
        skills: workerData.skills,
        categories: [workerData.category],
        experience: workerData.experience,
        pricePerHour: workerData.pricePerHour,
        rating: Math.random() * 2 + 3, // Random rating between 3-5
        totalReviews: Math.floor(Math.random() * 50) + 10, // 10-60 reviews
        location: {
          type: 'Point',
          coordinates: workerData.location.coordinates,
          address: workerData.location.address,
          city: workerData.location.city,
          state: workerData.location.state,
          keywords: {
            city: workerData.location.city,
            state: workerData.location.state,
            fullAddress: workerData.location.address
          }
        },
        availability: 'available',
        verified: true,
        isActive: true,
        approvalStatus: 'approved',
        completedJobs: Math.floor(Math.random() * 100) + 20,
        totalJobs: Math.floor(Math.random() * 120) + 25
      });

      console.log(`✅ Created: ${workerData.name} (${workerData.category})`);
      created++;
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Successfully created ${created} workers`);
    console.log(`⏭️  Skipped ${skipped} workers (already exist)`);
    console.log('─'.repeat(50));
    
    console.log('\n📋 Test Login Credentials (for any worker):');
    console.log('   Email: rajesh.plumber@test.com');
    console.log('   Password: Worker@123\n');

    console.log('🧪 Now test the algorithm:');
    console.log('   1. Go to: http://localhost:5173');
    console.log('   2. Search for workers in Bangalore');
    console.log('   3. Try different categories: Plumber, Electrician, etc.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedWorkers();
