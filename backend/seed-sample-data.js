/**
 * Sample Data Seeder for Worker Dashboard Testing
 * Creates:
 * - 1 Test User (customer)
 * - 1 Test Worker (service provider)
 * - Multiple Bookings (jobs)
 * - Multiple Reviews
 * 
 * Run: node seed-sample-data.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import Models
const User = require('./models/User.model');
const Worker = require('./models/Worker.model');
const Booking = require('./models/Booking.model');
const Review = require('./models/Review.model');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.yellow}${msg}${colors.reset}\n`),
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Create sample data
 */
const seedData = async () => {
  try {
    log.header('🌱 SEEDING SAMPLE DATA FOR WORKER DASHBOARD');

    // 1. Create Sample User (Customer)
    log.info('Creating test customer user...');
    const testUser = await User.findOneAndUpdate(
      { email: 'customer@test.com' },
      {
        name: 'Priya Sharma',
        email: 'customer@test.com',
        phone: '+91 98765 43210',
        role: 'user',
        password: await bcrypt.hash('Test@123', 10),
        isVerified: true,
      },
      { upsert: true, new: true }
    );
    log.success(`Customer user: ${testUser.name} (${testUser._id})`);

    // 2. Create Sample Worker
    log.info('Creating test worker...');
    let workerUser = await User.findOneAndUpdate(
      { email: 'worker@test.com' },
      {
        name: 'Raj Kumar',
        email: 'worker@test.com',
        phone: '+91 99876 54321',
        role: 'worker',
        password: await bcrypt.hash('Test@123', 10),
        isVerified: true,
      },
      { upsert: true, new: true }
    );

    const testWorker = await Worker.findOneAndUpdate(
      { userId: workerUser._id },
      {
        userId: workerUser._id,
        skills: ['Plumbing', 'Electrical Work', 'Carpentry'],
        serviceCategories: ['Plumbing', 'Electrical', 'Carpentry'],
        experience: '5 years',
        pricing: {
          hourly: 500,
          fixed: true,
        },
        location: {
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          coordinates: {
            lat: 19.0760,
            lng: 72.8777,
          },
        },
        documents: {
          verified: true,
          verificationDate: new Date(),
        },
        stats: {
          totalJobs: 0,
          completedJobs: 0,
          cancelledJobs: 0,
          totalEarnings: 0,
          averageRating: 0,
        },
      },
      { upsert: true, new: true }
    );
    log.success(`Worker: ${testWorker.userId} (${testWorker._id})`);

    // 3. Create Sample Bookings
    log.info('Creating sample bookings...');
    const bookingDates = [
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'completed' }, // 5 days ago
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'completed' }, // 3 days ago
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'completed' }, // yesterday
      { date: new Date(Date.now()), status: 'in-progress' }, // today
      { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), status: 'accepted' }, // tomorrow
    ];

    const bookings = [];
    for (let i = 0; i < bookingDates.length; i++) {
      const booking = await Booking.create({
        userId: testUser._id,
        workerId: testWorker._id,
        serviceCategory: ['Plumbing', 'Electrical', 'Carpentry'][i % 3],
        description: `Test ${['Plumbing', 'Electrical', 'Carpentry'][i % 3]} service`,
        location: {
          address: '456 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
        },
        scheduledDate: bookingDates[i].date,
        scheduledTime: new Date(bookingDates[i].date.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        estimatedDuration: '2 hours',
        priceQuoted: 500 + i * 100,
        status: bookingDates[i].status,
        workerEarning: (500 + i * 100) * 0.9, // 90% to worker
        createdAt: bookingDates[i].date,
        updatedAt: bookingDates[i].date,
      });
      bookings.push(booking);
    }
    log.success(`Created ${bookings.length} bookings`);

    // 4. Create Sample Reviews (for completed bookings)
    log.info('Creating sample reviews...');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const reviews = [];
    for (let i = 0; i < completedBookings.length; i++) {
      const review = await Review.create({
        bookingId: completedBookings[i]._id,
        workerId: testWorker._id,
        userId: testUser._id,
        rating: [4, 5, 4.5][i % 3],
        comment: ['Good work', 'Excellent service', 'Professional and timely'][i % 3],
        category: ['timeliness', 'quality', 'communication'][i % 3],
        createdAt: new Date(completedBookings[i].createdAt.getTime() + 1 * 24 * 60 * 60 * 1000),
      });
      reviews.push(review);
    }
    log.success(`Created ${reviews.length} reviews`);

    // 5. Update Worker Stats
    log.info('Updating worker statistics...');
    const totalJobs = bookings.length;
    const completedJobs = bookings.filter(b => b.status === 'completed').length;
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.workerEarning, 0);
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Worker.findByIdAndUpdate(testWorker._id, {
      'stats.totalJobs': totalJobs,
      'stats.completedJobs': completedJobs,
      'stats.totalEarnings': totalEarnings,
      'stats.averageRating': avgRating,
    });
    log.success('Worker stats updated');

    // Summary
    log.header('📊 SAMPLE DATA SUMMARY');
    console.log(`
  👤 Test Customer:
     Email: customer@test.com
     Password: Test@123
     ID: ${testUser._id}

  🔧 Test Worker:
     Email: worker@test.com
     Password: Test@123
     ID: ${testWorker._id}
     User ID: ${workerUser._id}

  📋 Data Created:
     Bookings: ${totalJobs}
     Completed: ${completedJobs}
     In Progress: ${bookings.filter(b => b.status === 'in-progress').length}
     Pending: ${bookings.filter(b => b.status === 'pending').length}
     Accepted: ${bookings.filter(b => b.status === 'accepted').length}

  💰 Earnings:
     Total Earnings: ₹${totalEarnings.toFixed(2)}
     Average Rating: ${avgRating.toFixed(2)} ⭐

  📝 Reviews: ${reviews.length}
    `);

    log.success('✨ Sample data seeded successfully!');
    log.info(`Next steps:
   1. Login as worker: worker@test.com / Test@123
   2. Visit worker dashboard to see sample data
   3. Test all dashboard features
    `);
  } catch (error) {
    log.error('Error seeding data:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log.success('Database connection closed');
  }
};

/**
 * Run seeder
 */
connectDB().then(() => seedData());
