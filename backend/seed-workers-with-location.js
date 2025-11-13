/**
 * SEED TEST WORKERS WITH LOCATIONS
 * Run: node seed-workers-with-location.js
 * 
 * Creates test workers with location data for searching
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Worker = require('./models/Worker.model');
const WorkerUser = require('./models/WorkerUser.model');
const User = require('./models/User.model');

const LOCATIONS = [
  {
    name: 'Plumber - Delhi',
    category: 'Plumber',
    location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
    keywords: {
      city: 'Delhi',
      area: 'Connaught Place',
      sector: 'Central Delhi',
      landmark: 'Near Central Delhi',
      fullAddress: 'Connaught Place, Delhi 110001, India'
    },
    price: 500,
    email: 'plumber1@test.com'
  },
  {
    name: 'Electrician - Gurgaon',
    category: 'Electrician',
    location: { type: 'Point', coordinates: [77.0369, 28.4595] }, // Gurgaon
    keywords: {
      city: 'Gurgaon',
      area: 'Sector 32',
      sector: 'Sector 32',
      landmark: 'Near Cyber Hub',
      fullAddress: 'Sector 32, Gurgaon 122001, Haryana'
    },
    price: 600,
    email: 'electrician1@test.com'
  },
  {
    name: 'Carpenter - Delhi',
    category: 'Carpenter',
    location: { type: 'Point', coordinates: [77.1025, 28.7041] }, // Delhi (North)
    keywords: {
      city: 'Delhi',
      area: 'Dwarka',
      sector: 'Sector 7',
      landmark: 'Near Dwarka Mor',
      fullAddress: 'Sector 7, Dwarka, Delhi 110075, India'
    },
    price: 700,
    email: 'carpenter1@test.com'
  },
  {
    name: 'Painter - Noida',
    category: 'Painter',
    location: { type: 'Point', coordinates: [77.3910, 28.5355] }, // Noida
    keywords: {
      city: 'Noida',
      area: 'Sector 18',
      sector: 'Sector 18',
      landmark: 'Near Noida City Center',
      fullAddress: 'Sector 18, Noida 201301, Uttar Pradesh'
    },
    price: 400,
    email: 'painter1@test.com'
  },
  {
    name: 'Plumber - Gurgaon',
    category: 'Plumber',
    location: { type: 'Point', coordinates: [77.0505, 28.4089] }, // Gurgaon (South)
    keywords: {
      city: 'Gurgaon',
      area: 'Sector 50',
      sector: 'Sector 50',
      landmark: 'Near Golf Course Road',
      fullAddress: 'Sector 50, Gurgaon 122001, Haryana'
    },
    price: 550,
    email: 'plumber2@test.com'
  }
];

async function seedWorkers() {
  try {
    console.log('🌱 Starting to seed workers with locations...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing workers (optional - comment out to keep existing)
    // await Worker.deleteMany({});
    // console.log('🗑️ Cleared existing workers');

    for (const workerData of LOCATIONS) {
      try {
        // Check if worker already exists
        const existing = await Worker.findOne({ email: workerData.email });
        if (existing) {
          console.log(`⏭️ Skipping ${workerData.name} (already exists)`);
          continue;
        }

        // Create test user first (if doesn't exist)
        let user = await User.findOne({ email: workerData.email });
        if (!user) {
          user = await User.create({
            name: workerData.name,
            email: workerData.email,
            password: 'Test@123',
            phone: '+919876543210',
            role: 'worker',
            isActive: true
          });
          console.log(`✅ Created user: ${workerData.name}`);
        }

        // Create worker document
        const worker = await Worker.create({
          userId: user._id,
          profileImage: 'https://via.placeholder.com/400x400?text=' + workerData.name.split(' ')[0],
          location: {
            type: 'Point',
            coordinates: workerData.location.coordinates,
            city: workerData.keywords.city,
            area: workerData.keywords.area,
            keywords: workerData.keywords  // NEW: Store location keywords
          },
          categories: [workerData.category],
          pricePerHour: workerData.price,
          experience: Math.floor(Math.random() * 8) + 2, // 2-10 years
          bio: `Professional ${workerData.category} with great experience and customer reviews`,
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
          totalReviews: Math.floor(Math.random() * 100),
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].slice(0, Math.floor(Math.random() * 5) + 1),
          approvalStatus: 'approved',
          isActive: true,
          certifications: ['Verified', 'Trusted Worker'],
          languages: ['English', 'Hindi']
        });

        console.log(`✅ Created worker: ${workerData.name} at [${workerData.location.coordinates}]`);
      } catch (err) {
        console.error(`❌ Error creating ${workerData.name}:`, err.message);
      }
    }

    // Verify workers were created
    const count = await Worker.countDocuments({ approvalStatus: 'approved', isActive: true });
    console.log(`\n🎯 Total approved active workers: ${count}`);

    // Show sample workers
    const samples = await Worker.find({ approvalStatus: 'approved', isActive: true })
      .select('userId categories pricePerHour location approvalStatus isActive')
      .limit(3);
    console.log('\n📍 Sample workers:');
    samples.forEach(w => {
      console.log(`  - ${w.categories.join(', ')} at [${w.location.coordinates}] - ₹${w.pricePerHour}/hr`);
    });

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedWorkers();
