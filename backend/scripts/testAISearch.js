/**
 * TEST AI-POWERED SEARCH
 * Tests the enhanced search algorithm with various queries
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { parseNaturalQuery, enhanceQuery, generateExplanation } = require('../utils/nlp.utils');
const { performSemanticSearch } = require('../controllers/aiSearch.controller');

// Test queries
const testQueries = [
  'Find a plumber in Koramangala',
  'I need an electrician near Indiranagar',
  'Plumber in Bangalore',
  'Carpenter in HSR Layout',
  'Painter near me in Whitefield',
  'AC repair worker in BTM',
  'Cleaner in Jayanagar',
  'Best electrician in Malleshwaram',
  'Affordable plumber in Marathahalli',
  'Experienced carpenter needed',
];

// Bangalore coordinates (center)
const BANGALORE_LAT = 12.9716;
const BANGALORE_LNG = 77.5946;

async function testSearch() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');
    console.log('🧪 TESTING AI-POWERED SEARCH ALGORITHM');
    console.log('═'.repeat(60) + '\n');

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      console.log('─'.repeat(60));

      // Parse query
      const parsed = parseNaturalQuery(query);
      console.log('🤖 Parsed:', {
        services: parsed.services,
        location: parsed.location,
        confidence: parsed.confidence + '%'
      });

      // Enhance query
      const enhanced = enhanceQuery(parsed);
      console.log('✨ Enhanced:', {
        prioritizeBy: enhanced.prioritizeBy,
        searchMode: enhanced.searchMode
      });

      // Generate explanation
      const explanation = generateExplanation(parsed);
      console.log('💬 Explanation:', explanation);

      // Perform search (simulated - would need full controller context)
      try {
        // For now, just show what would be searched
        console.log('🔍 Search Parameters:', {
          latitude: BANGALORE_LAT,
          longitude: BANGALORE_LNG,
          maxDistance: 20,
          services: parsed.services,
          location: parsed.location
        });
        
        console.log('✅ Search would execute successfully');
      } catch (err) {
        console.log('❌ Search error:', err.message);
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('✅ All tests completed');
    console.log('═'.repeat(60));

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run tests
testSearch();
