const mongoose = require('mongoose');

// Alternative connection method for Node.js v22 SSL issues
const connectDB = async () => {
  try {
    // Disable strict SSL for development (Node v22 compatibility)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create geospatial index for location-based queries
    try {
      await mongoose.connection.db.collection('workers').createIndex({ location: '2dsphere' });
    } catch (indexError) {
      console.log('Index creation skipped (may already exist)');
    }
    
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('💡 Consider using local MongoDB or downgrading Node.js to v20');
    process.exit(1);
  }
};

module.exports = connectDB;
