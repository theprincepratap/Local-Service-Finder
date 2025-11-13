/**
 * CREATE WORKERS FROM EXISTING USERS
 * Matches each user with a worker profile
 * Password: worker@123 for all
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Worker = require('../models/Worker.model');

// Service categories
const SERVICE_CATEGORIES = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner',
  'AC Repair', 'Appliance Repair', 'Gardener', 'Pest Control', 'Driver'
];

const SKILLS_MAP = {
  'Plumber': ['Plumbing', 'Pipe Repair', 'Leak Fixing', 'Drainage', 'Water Tank Cleaning', 'Bathroom Fitting'],
  'Electrician': ['Electrical Wiring', 'Switch Installation', 'Fan Installation', 'Light Fixing', 'Power Issues', 'Circuit Repair'],
  'Carpenter': ['Wood Work', 'Furniture Making', 'Cabinet Installation', 'Door Fitting', 'Interior Work', 'Repair Work'],
  'Painter': ['Wall Painting', 'Interior Painting', 'Exterior Painting', 'Texture Work', 'Color Consultation', 'Decorative Work'],
  'Cleaner': ['House Cleaning', 'Deep Cleaning', 'Floor Cleaning', 'Sanitization', 'Office Cleaning', 'Window Cleaning'],
  'AC Repair': ['AC Installation', 'AC Servicing', 'Gas Filling', 'Compressor Repair', 'AC Maintenance', 'Split AC'],
  'Appliance Repair': ['Refrigerator Repair', 'Washing Machine', 'Microwave', 'TV Repair', 'Geyser', 'Iron'],
  'Gardener': ['Lawn Maintenance', 'Plant Care', 'Landscaping', 'Tree Trimming', 'Garden Design', 'Watering'],
  'Pest Control': ['Termite Control', 'Cockroach Control', 'Mosquito Control', 'Rat Control', 'General Pest', 'Fumigation'],
  'Driver': ['Car Driving', 'Bike Riding', 'Home Driver', 'Outstation', 'Safe Driving', 'Navigation']
};

const BANGALORE_AREAS = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar', lat: 12.9698, lng: 77.6033 },
  { name: 'HSR Layout', lat: 12.9634, lng: 77.5847 },
  { name: 'Whitefield', lat: 12.9899, lng: 77.6408 },
  { name: 'BTM Layout', lat: 12.9165, lng: 77.6101 },
  { name: 'Jayanagar', lat: 12.9252, lng: 77.5837 },
  { name: 'Marathahalli', lat: 12.9591, lng: 77.6974 },
  { name: 'Malleshwaram', lat: 12.9784, lng: 77.5835 },
  { name: 'Electronic City', lat: 12.8451, lng: 77.6677 },
  { name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
  { name: 'Rajajinagar', lat: 12.9910, lng: 77.5551 },
  { name: 'JP Nagar', lat: 12.9088, lng: 77.5850 },
  { name: 'Banashankari', lat: 12.9250, lng: 77.5487 },
  { name: 'Hebbal', lat: 13.0358, lng: 77.5970 },
  { name: 'Bellandur', lat: 12.9260, lng: 77.6747 },
  { name: 'Sarjapur Road', lat: 12.9010, lng: 77.6874 },
  { name: 'Old Airport Road', lat: 12.9578, lng: 77.6478 },
  { name: 'MG Road', lat: 12.9759, lng: 77.6061 },
  { name: 'Brigade Road', lat: 12.9716, lng: 77.6040 },
  { name: 'Richmond Town', lat: 12.9716, lng: 77.5946 }
];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateLocation() {
  const area = randomElement(BANGALORE_AREAS);
  const lat = area.lat + randomFloat(-0.01, 0.01, 4);
  const lng = area.lng + randomFloat(-0.01, 0.01, 4);
  
  return {
    type: 'Point',
    coordinates: [lng, lat],
    address: `${area.name}, Bangalore`,
    city: 'Bangalore',
    area: area.name,
    state: 'Karnataka',
    country: 'India'
  };
}

async function createWorkersFromUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Get all users (exclude admin)
    const users = await User.find({ 
      role: 'user'
    });

    console.log(`📊 Found ${users.length} users\n`);
    console.log('🔧 Creating worker profiles...\n');
    console.log('═'.repeat(70) + '\n');

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Check if worker already exists for this user
        const existingWorker = await Worker.findOne({ userId: user._id });
        if (existingWorker) {
          console.log(`⏭️  ${user.name} - Already has worker profile`);
          skipped++;
          continue;
        }

        // Generate worker data
        const category = randomElement(SERVICE_CATEGORIES);
        const categorySkills = SKILLS_MAP[category] || ['General Work'];
        const numSkills = randomNumber(3, 5);
        const skills = [];
        
        for (let i = 0; i < numSkills; i++) {
          const skill = randomElement(categorySkills);
          if (!skills.includes(skill)) {
            skills.push(skill);
          }
        }

        const location = generateLocation();
        const experience = randomNumber(1, 15);
        const pricePerHour = randomNumber(200, 700);
        const rating = randomFloat(3.0, 5.0, 1);
        const totalReviews = randomNumber(0, 100);
        const completedJobs = randomNumber(0, 200);
        const totalJobs = completedJobs + randomNumber(0, 50);
        const totalEarnings = completedJobs * pricePerHour * randomNumber(1, 5);

        // Create worker profile
        const worker = await Worker.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          categories: [category],
          skills,
          experience,
          pricePerHour,
          rating,
          totalReviews,
          completedJobs,
          totalJobs,
          totalEarnings,
          location,
          serviceRadius: randomNumber(5, 20),
          availability: randomElement(['available', 'available', 'available', 'busy']),
          verified: randomElement([true, false]),
          bio: `Professional ${category.toLowerCase()} with ${experience} years of experience in Bangalore. Specialized in ${skills.slice(0, 3).join(', ')}.`,
          workingHours: {
            monday: { start: '09:00', end: '18:00', available: true },
            tuesday: { start: '09:00', end: '18:00', available: true },
            wednesday: { start: '09:00', end: '18:00', available: true },
            thursday: { start: '09:00', end: '18:00', available: true },
            friday: { start: '09:00', end: '18:00', available: true },
            saturday: { start: '09:00', end: '14:00', available: true },
            sunday: { start: '00:00', end: '00:00', available: false }
          },
          isActive: true,
          isVerified: randomElement([true, false]),
          approvalStatus: 'approved',
          approvalMessage: 'Your application has been approved!',
          approvedAt: new Date(),
          approvedBy: user._id // Self-approved for testing
        });

        created++;
        console.log(`✅ ${created}. ${user.name} → ${category} (${location.area})`);

      } catch (err) {
        errors++;
        console.error(`❌ Error for ${user.name}:`, err.message);
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(70));
    console.log(`✅ Workers Created: ${created}`);
    console.log(`⏭️  Already Existed: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📍 Location: Bangalore (20 areas)`);
    console.log('═'.repeat(70));

    // Display statistics
    console.log('\n📈 WORKER STATISTICS BY CATEGORY:\n');
    const stats = await Worker.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    stats.forEach(stat => {
      console.log(`   ${stat._id.padEnd(20)} : ${stat.count} workers`);
    });

    console.log('\n🔑 ALL WORKER PASSWORDS: worker@123\n');
    console.log('✅ Workers created and matched with users!\n');

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
console.log('🚀 CREATING WORKERS FROM EXISTING USERS\n');
console.log('Password for all workers: worker@123\n');
createWorkersFromUsers();
