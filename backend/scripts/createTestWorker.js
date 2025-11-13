const mongoose = require('mongoose');
const User = require('../models/User.model');
const Worker = require('../models/Worker.model');
require('dotenv').config();

const createTestWorker = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    const email = 'worker@test.com';
    const password = 'Worker@123';

    // Check if worker already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️  Worker already exists with this email');
      console.log('\n📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👤 Role:', existingUser.role);
      process.exit(0);
    }

    // Create User with worker role
    const user = await User.create({
      name: 'Test Worker',
      email,
      password,
      phone: '9999999999',
      role: 'worker',
      isActive: true
    });

    // Create Worker profile
    const worker = await Worker.create({
      userId: user._id,
      bio: 'Experienced test worker',
      experience: 5,
      categories: ['Plumber', 'Electrician'],
      skills: ['Pipe Fitting', 'Wiring'],
      pricePerHour: 500,
      location: {
        type: 'Point',
        coordinates: [80.2707, 13.0827], // Chennai coordinates
        address: 'Chennai, Tamil Nadu'
      },
      serviceRadius: 10,
      isAvailable: true,
      isVerified: true,
      workingHours: {
        monday: { isAvailable: true, start: '09:00', end: '18:00' },
        tuesday: { isAvailable: true, start: '09:00', end: '18:00' },
        wednesday: { isAvailable: true, start: '09:00', end: '18:00' },
        thursday: { isAvailable: true, start: '09:00', end: '18:00' },
        friday: { isAvailable: true, start: '09:00', end: '18:00' },
        saturday: { isAvailable: true, start: '09:00', end: '14:00' },
        sunday: { isAvailable: false }
      }
    });

    console.log('\n✅ Test Worker created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', user.role);
    console.log('🆔 User ID:', user._id);
    console.log('🔧 Worker ID:', worker._id);
    console.log('\n🎯 You can now login with these credentials and access the worker dashboard!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test worker:', error);
    process.exit(1);
  }
};

createTestWorker();
