/**
 * UPDATE WORKERS WITH LOCATION KEYWORDS
 * Adds proper location keywords for better search matching
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('../models/Worker.model');

async function updateWorkers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Get all workers
    const workers = await Worker.find({});
    console.log(`📊 Found ${workers.length} workers to update\n`);

    let updated = 0;
    let skipped = 0;

    for (const worker of workers) {
      try {
        // Extract location info from address
        const address = worker.location?.address || '';
        
        // Parse address components
        const addressLower = address.toLowerCase();
        let city = 'Bangalore';
        let area = '';
        let state = 'Karnataka';
        
        // Detect city/area from address
        const bangaloreAreas = {
          'koramangala': 'Koramangala',
          'indiranagar': 'Indiranagar',
          'whitefield': 'Whitefield',
          'hsr layout': 'HSR Layout',
          'hsr': 'HSR Layout',
          'marathahalli': 'Marathahalli',
          'btm layout': 'BTM Layout',
          'btm': 'BTM Layout',
          'jayanagar': 'Jayanagar',
          'malleshwaram': 'Malleshwaram',
          'electronic city': 'Electronic City',
          'yelahanka': 'Yelahanka',
          'rajajinagar': 'Rajajinagar',
          'jp nagar': 'JP Nagar',
          'banashankari': 'Banashankari'
        };

        for (const [key, value] of Object.entries(bangaloreAreas)) {
          if (addressLower.includes(key)) {
            area = value;
            break;
          }
        }

        // Update worker with location keywords
        if (worker.location && worker.location.coordinates) {
          worker.location.city = city;
          worker.location.area = area || address.split(',')[0]?.trim();
          worker.location.state = state;
          worker.location.country = 'India';

          await worker.save();
          console.log(`✅ Updated: ${worker.name} - ${area || 'Unknown area'}`);
          updated++;
        } else {
          console.log(`⏭️  Skipped: ${worker.name} - No coordinates`);
          skipped++;
        }

      } catch (err) {
        console.error(`❌ Error updating ${worker.name}:`, err.message);
        skipped++;
      }
    }

    console.log('\n' + '─'.repeat(50));
    console.log(`✅ Updated: ${updated} workers`);
    console.log(`⏭️  Skipped: ${skipped} workers`);
    console.log('─'.repeat(50));

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
updateWorkers();
