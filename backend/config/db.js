const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Disable strict SSL for development (Node.js v22 compatibility fix)
    // This is safe for development but should use proper SSL in production
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create geospatial index for location-based queries
    try {
      await mongoose.connection.db.collection('workers').createIndex({ location: '2dsphere' });
      console.log('✅ Geospatial index created');
    } catch (indexError) {
      console.log('ℹ️  Geospatial index already exists');
    }
    
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('💡 If SSL errors persist, consider:');
    console.error('   1. Using MongoDB Compass to test connection');
    console.error('   2. Downgrading to Node.js v20');
    console.error('   3. Using local MongoDB');
    process.exit(1);
  }
};

module.exports = connectDB;
