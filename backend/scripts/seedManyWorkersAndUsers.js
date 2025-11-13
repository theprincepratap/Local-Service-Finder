/**
 * SEED MANY WORKERS AND USERS
 * Creates 50+ workers and 100+ users with random Indian names
 * All centered around Bangalore (Lat: 12.9716, Lon: 77.5946)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Worker = require('../models/Worker.model');

// Random Indian names database
const FIRST_NAMES = {
  male: [
    'Rajesh', 'Amit', 'Suresh', 'Vikram', 'Prakash', 'Ramesh', 'Manoj', 'Satish',
    'Arun', 'Ravi', 'Karthik', 'Mohan', 'Deepak', 'Sanjay', 'Vinod', 'Ajay',
    'Rahul', 'Rohit', 'Nitin', 'Vishal', 'Ashok', 'Sandeep', 'Pradeep', 'Naveen',
    'Anand', 'Krishna', 'Ganesh', 'Mahesh', 'Dinesh', 'Sunil', 'Anil', 'Vijay',
    'Mukesh', 'Yogesh', 'Pankaj', 'Akhil', 'Arjun', 'Varun', 'Manish', 'Sachin',
    'Kamal', 'Sumit', 'Akash', 'Neeraj', 'Siddharth', 'Harish', 'Kishore', 'Praveen'
  ],
  female: [
    'Priya', 'Sneha', 'Pooja', 'Anjali', 'Kavita', 'Rekha', 'Anita', 'Sunita',
    'Neha', 'Ritu', 'Divya', 'Swati', 'Preeti', 'Shweta', 'Nisha', 'Seema',
    'Meera', 'Lakshmi', 'Sarita', 'Geeta', 'Radha', 'Shalini', 'Madhuri', 'Aarti',
    'Shruti', 'Nidhi', 'Pallavi', 'Manisha', 'Deepika', 'Kavya', 'Ritika', 'Simran'
  ]
};

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Singh', 'Patel', 'Reddy', 'Rao', 'Verma', 'Gupta',
  'Joshi', 'Iyer', 'Nair', 'Menon', 'Pillai', 'Desai', 'Mehta', 'Shah',
  'Agarwal', 'Bansal', 'Jain', 'Malhotra', 'Chopra', 'Bhatia', 'Kapoor', 'Khanna',
  'Sethi', 'Arora', 'Sinha', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Trivedi',
  'Shukla', 'Saxena', 'Kashyap', 'Bose', 'Ghosh', 'Chatterjee', 'Mukherjee', 'Das'
];

// Only valid categories from Worker model enum
const SERVICE_CATEGORIES = [
  'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Cleaner',
  'AC Repair', 'Appliance Repair', 'Gardener', 'Pest Control', 'Driver'
];

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

const SKILLS_MAP = {
  'Plumber': ['Plumbing', 'Pipe Repair', 'Leak Fixing', 'Drainage', 'Water Tank Cleaning', 'Bathroom Fitting'],
  'Electrician': ['Electrical Wiring', 'Switch Installation', 'Fan Installation', 'Light Fixing', 'Power Issues'],
  'Carpenter': ['Wood Work', 'Furniture Making', 'Cabinet Installation', 'Door Fitting', 'Interior Work'],
  'Painter': ['Wall Painting', 'Interior Painting', 'Exterior Painting', 'Texture Work', 'Color Consultation'],
  'Cleaner': ['House Cleaning', 'Deep Cleaning', 'Floor Cleaning', 'Sanitization', 'Office Cleaning'],
  'AC Repair': ['AC Installation', 'AC Servicing', 'Gas Filling', 'Compressor Repair', 'AC Maintenance'],
  'Appliance Repair': ['Refrigerator Repair', 'Washing Machine', 'Microwave', 'TV Repair', 'Geyser'],
  'Gardener': ['Lawn Maintenance', 'Plant Care', 'Landscaping', 'Tree Trimming', 'Garden Design'],
  'Pest Control': ['Termite Control', 'Cockroach Control', 'Mosquito Control', 'Rat Control', 'General Pest'],
  'Mason': ['Brick Work', 'Plastering', 'Tiling', 'Flooring', 'Construction Work'],
  'Welder': ['Metal Welding', 'Gate Repair', 'Grills', 'Steel Work', 'Iron Work'],
  'Mechanic': ['Car Repair', 'Bike Repair', 'Engine Work', 'General Servicing', 'Parts Replacement'],
  'Driver': ['Car Driving', 'Bike Riding', 'Home Driver', 'Outstation', 'Safe Driving'],
  'Cook': ['Indian Cooking', 'Home Cooking', 'Multi Cuisine', 'Meal Preparation', 'Catering'],
  'Security Guard': ['Security', 'Surveillance', 'Night Duty', 'Property Protection', 'Vigilance']
};

// Helper functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateIndianName(gender = null) {
  if (!gender) {
    gender = Math.random() > 0.5 ? 'male' : 'female';
  }
  const firstName = randomElement(FIRST_NAMES[gender]);
  const lastName = randomElement(LAST_NAMES);
  return { firstName, lastName, fullName: `${firstName} ${lastName}`, gender };
}

function generateEmail(firstName, lastName, domain = null) {
  if (!domain) {
    domain = randomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com']);
  }
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}`;
  return username + '@' + domain;
}

function generateIndianPhone() {
  // Indian mobile format: 10 digits starting with 9, 8, or 7
  const prefix = randomElement(['9', '8', '7']);
  const number = prefix + String(randomNumber(100000000, 999999999)).substring(0, 9);
  return number; // Return 10-digit number without +91
}

function generateLocation() {
  const area = randomElement(BANGALORE_AREAS);
  // Add small random offset (±0.01 degrees = ~1km)
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

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Configuration
    const NUM_WORKERS = 50;  // Create 50 workers
    const NUM_USERS = 100;    // Create 100 users

    console.log('🌱 Starting database seeding...\n');
    console.log(`📊 Target: ${NUM_WORKERS} workers + ${NUM_USERS} users\n`);
    console.log('═'.repeat(70) + '\n');

    // ============================================
    // PART 1: CREATE REGULAR USERS
    // ============================================
    console.log('👥 CREATING REGULAR USERS...\n');
    
    let usersCreated = 0;
    let usersSkipped = 0;

    for (let i = 0; i < NUM_USERS; i++) {
      try {
        const { firstName, lastName, fullName, gender } = generateIndianName();
        const email = generateEmail(firstName, lastName);
        const phone = generateIndianPhone();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          usersSkipped++;
          continue;
        }

        // Create user
        const hashedPassword = await bcrypt.hash('User@123', 10);
        const user = await User.create({
          name: fullName,
          email,
          phone,
          password: hashedPassword,
          role: 'user',
          isActive: true
        });

        usersCreated++;
        if (usersCreated % 10 === 0) {
          console.log(`✅ Created ${usersCreated} users...`);
        }

      } catch (err) {
        if (err.code === 11000) {
          usersSkipped++;
        } else {
          console.error(`❌ Error creating user ${i + 1}:`, err.message);
        }
      }
    }

    console.log(`\n✅ Users Created: ${usersCreated}`);
    console.log(`⏭️  Users Skipped: ${usersSkipped}\n`);
    console.log('─'.repeat(70) + '\n');

    // ============================================
    // PART 2: CREATE WORKERS
    // ============================================
    console.log('🔧 CREATING WORKERS...\n');

    let workersCreated = 0;
    let workersSkipped = 0;

    for (let i = 0; i < NUM_WORKERS; i++) {
      try {
        const { firstName, lastName, fullName, gender } = generateIndianName('male');
        const category = randomElement(SERVICE_CATEGORIES);
        const email = generateEmail(firstName, lastName, 'worker.com');
        const phone = generateIndianPhone();

        // Check if worker email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          workersSkipped++;
          continue;
        }

        // Create user account for worker
        const hashedPassword = await bcrypt.hash('Worker@123', 10);
        const user = await User.create({
          name: fullName,
          email,
          phone,
          password: hashedPassword,
          role: 'worker',
          isActive: true
        });

        // Get random skills for this category
        const categorySkills = SKILLS_MAP[category] || ['General Work'];
        const numSkills = randomNumber(3, 5);
        const skills = [];
        for (let j = 0; j < numSkills; j++) {
          const skill = randomElement(categorySkills);
          if (!skills.includes(skill)) {
            skills.push(skill);
          }
        }

        // Generate worker data
        const location = generateLocation();
        const experience = randomNumber(1, 15);
        const pricePerHour = randomNumber(200, 600);
        const rating = randomFloat(3.0, 5.0, 1);
        const totalRatings = randomNumber(5, 100);
        const completedJobs = randomNumber(10, 200);

        // Create worker profile
        const worker = await Worker.create({
          userId: user._id,
          name: fullName,
          email,
          phone,
          categories: [category],
          skills,
          experience,
          pricePerHour,
          rating,
          totalRatings,
          completedJobs,
          location,
          availability: randomElement(['available', 'available', 'available', 'busy']), // 75% available
          approvalStatus: 'approved',
          isActive: true,
          bio: `Professional ${category.toLowerCase()} with ${experience} years of experience in Bangalore.`
        });

        workersCreated++;
        console.log(`✅ ${workersCreated}. ${fullName} (${category}) - ${location.area}`);

      } catch (err) {
        if (err.code === 11000) {
          workersSkipped++;
        } else {
          console.error(`❌ Error creating worker ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n' + '═'.repeat(70));
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(70));
    console.log(`✅ Total Users Created: ${usersCreated}`);
    console.log(`✅ Total Workers Created: ${workersCreated}`);
    console.log(`⏭️  Total Skipped: ${usersSkipped + workersSkipped}`);
    console.log(`📍 All centered around: Bangalore (12.9716, 77.5946)`);
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

    console.log('\n🎯 TEST LOGIN CREDENTIALS:\n');
    console.log('   Regular User:');
    console.log('   - Use any created email');
    console.log('   - Password: User@123\n');
    console.log('   Worker:');
    console.log('   - Use any worker email');
    console.log('   - Password: Worker@123\n');
    console.log('   Admin:');
    console.log('   - Email: admin@localworker.com');
    console.log('   - Password: Admin@123\n');

    console.log('✅ Database seeding completed successfully!\n');

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
console.log('🚀 MASS SEEDING SCRIPT STARTED\n');
console.log('Creating workers and users with random Indian names...\n');
seedDatabase();
