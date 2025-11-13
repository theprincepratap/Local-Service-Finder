/**
 * AI-POWERED SEARCH CONTROLLER
 * Integrates NLP query processing with semantic matching
 * Provides conversational search capability
 */

const User = require('../models/User.model');
const Worker = require('../models/Worker.model');
const {
  parseNaturalQuery,
  enhanceQuery,
  generateExplanation,
  convertToSearchParams
} = require('../utils/nlp.utils');

/**
 * AI-powered search endpoint
 * Accepts natural language queries and returns matched workers
 * GET /api/search/ai-powered
 * 
 * Query Parameters:
 * - query (required): Natural language search query
 * - latitude (required): User's latitude
 * - longitude (required): User's longitude
 * - maxDistance: Max search radius in km (default: 15)
 * - limit: Number of results (default: 10)
 */
async function aiPoweredSearch(req, res) {
  try {
    const { query, latitude, longitude, maxDistance = 15, limit = 10 } = req.query;

    // Validation
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        code: 'EMPTY_QUERY'
      });
    }

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'User location (latitude, longitude) is required',
        code: 'MISSING_LOCATION'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude',
        code: 'INVALID_LOCATION'
      });
    }

    // Parse natural language query
    console.log(`🤖 Processing AI search query: "${query}"`);
    const parsedQuery = parseNaturalQuery(query);
    console.log('📊 Parsed query:', parsedQuery);

    // Enhance query with semantic understanding
    const enhancedQuery = enhanceQuery(parsedQuery);
    console.log('✨ Enhanced query:', enhancedQuery);

    // Generate human-readable explanation
    const explanation = generateExplanation(parsedQuery);

    // If no services found, use keyword search
    if (parsedQuery.services.length === 0 && !parsedQuery.location) {
      console.log('⚠️ No specific service/location found, using keyword search');
      return await performKeywordSearch(req, res, query, lat, lng, maxDistance, limit, parsedQuery, explanation);
    }

    // Convert to standard search parameters
    const searchParams = convertToSearchParams(parsedQuery, lat, lng);

    // Perform geospatial + filter search
    const workers = await performSemanticSearch(
      lat,
      lng,
      maxDistance,
      parsedQuery,
      enhancedQuery,
      searchParams
    );

    // Rank results based on intent and priority
    const rankedWorkers = rankWorkers(workers, enhancedQuery, lat, lng);

    // Return results
    res.json({
      success: true,
      data: {
        query: parsedQuery,
        explanation,
        results: rankedWorkers.slice(0, parseInt(limit)),
        totalFound: rankedWorkers.length,
        searchMode: enhancedQuery.searchMode,
        confidence: parsedQuery.confidence,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('❌ AI Search Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Search failed',
      code: 'SEARCH_ERROR'
    });
  }
}

/**
 * Perform semantic search with filters and ranking
 * Enhanced with better location intelligence and flexible matching
 */
async function performSemanticSearch(latitude, longitude, maxDistance, parsedQuery, enhancedQuery, searchParams) {
  try {
    // Calculate search radius dynamically
    const radius = maxDistance || 20; // Default 20km
    const radiusInRadians = radius / 6371; // Earth radius in km
    
    // Build MongoDB query with location search
    const query = {
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      },
      approvalStatus: 'approved',
      isActive: true
    };

    // Add category filters if services specified (case-insensitive)
    if (parsedQuery.services && parsedQuery.services.length > 0) {
      // Create case-insensitive regex for each service
      const serviceRegexes = parsedQuery.services.map(service => 
        new RegExp(`^${service}$`, 'i')
      );
      query['categories'] = { $in: serviceRegexes };
    }

    // Add experience filter
    if (parsedQuery.minExperience > 0) {
      query['experience'] = { $gte: parsedQuery.minExperience };
    }

    // Add availability filter
    if (parsedQuery.availability !== 'all') {
      query['availability'] = parsedQuery.availability;
    }

    // Add price filter
    if (parsedQuery.maxPrice) {
      query['pricePerHour'] = { $lte: parsedQuery.maxPrice };
    }

    // Add rating filter if quality is important
    if (parsedQuery.intent.includes('quality')) {
      query['rating'] = { $gte: 4.0 };
    }

    console.log('🔍 MongoDB Query:', JSON.stringify(query, null, 2));

    // Execute query with location search
    let workers = await Worker.find(query)
      .select('_id name email phone categories skills pricePerHour rating totalRatings experience location availability profileImage bio completedJobs')
      .limit(50)
      .lean();

    console.log(`✅ Found ${workers.length} workers with nearSphere`);

    // If no results with strict geo search and we have a location keyword, try text search
    if (workers.length === 0 && parsedQuery.location) {
      console.log(`🔄 Trying location keyword search: "${parsedQuery.location}"`);
      
      const textQuery = {
        approvalStatus: 'approved',
        isActive: true,
        $or: [
          { 'location.address': new RegExp(parsedQuery.location, 'i') },
          { 'location.city': new RegExp(parsedQuery.location, 'i') },
          { 'location.state': new RegExp(parsedQuery.location, 'i') },
          { 'location.area': new RegExp(parsedQuery.location, 'i') }
        ]
      };

      // Add service filter (case-insensitive)
      if (parsedQuery.services && parsedQuery.services.length > 0) {
        const serviceRegexes = parsedQuery.services.map(service => 
          new RegExp(`^${service}$`, 'i')
        );
        textQuery['categories'] = { $in: serviceRegexes };
      }

      workers = await Worker.find(textQuery)
        .select('_id name email phone categories skills pricePerHour rating totalRatings experience location availability profileImage bio completedJobs')
        .limit(50)
        .lean();

      console.log(`✅ Found ${workers.length} workers with text search`);
    }

    // If still no results, try broader search without location restriction
    if (workers.length === 0) {
      console.log(`� Trying broader search without strict location`);
      
      const broadQuery = {
        approvalStatus: 'approved',
        isActive: true
      };

      if (parsedQuery.services && parsedQuery.services.length > 0) {
        const serviceRegexes = parsedQuery.services.map(service => 
          new RegExp(`^${service}$`, 'i')
        );
        broadQuery['categories'] = { $in: serviceRegexes };
      }

      workers = await Worker.find(broadQuery)
        .select('_id name email phone categories skills pricePerHour rating totalRatings experience location availability profileImage bio completedJobs')
        .limit(20)
        .lean();

      console.log(`✅ Found ${workers.length} workers with broad search`);
    }

    return workers;
  } catch (error) {
    console.error('❌ Semantic search error:', error);
    
    // Fallback: Try basic search without geospatial
    console.log('🔄 Falling back to basic search...');
    try {
      const fallbackQuery = {
        approvalStatus: 'approved',
        isActive: true
      };

      if (parsedQuery.services && parsedQuery.services.length > 0) {
        const serviceRegexes = parsedQuery.services.map(service => 
          new RegExp(`^${service}$`, 'i')
        );
        fallbackQuery['categories'] = { $in: serviceRegexes };
      }

      const workers = await Worker.find(fallbackQuery)
        .select('_id name email phone categories skills pricePerHour rating totalRatings experience location availability profileImage bio completedJobs')
        .limit(20)
        .lean();

      console.log(`✅ Fallback found ${workers.length} workers`);
      return workers;
    } catch (fallbackError) {
      console.error('❌ Fallback search also failed:', fallbackError);
      throw error;
    }
  }
}

/**
 * Perform keyword-based search when specific service not found
 */
async function performKeywordSearch(req, res, keyword, lat, lng, maxDistance, limit, parsedQuery, explanation) {
  try {
    console.log(`🔍 Performing keyword search: "${keyword}"`);

    const query = {
      'location.coordinates': {
        $geoWithin: {
          $box: [
            [lng - 0.135, lat - 0.135],
            [lng + 0.135, lat + 0.135]
          ]
        }
      },
      'isApproved': true,
      'isActive': true,
      '$text': { $search: keyword }
    };

    const workers = await Worker.find(query)
      .select('_id name serviceCategories hourlyRate averageRating totalReviews experienceYears location availability profilePicture bio')
      .lean();

    res.json({
      success: true,
      data: {
        query: {
          ...parsedQuery,
          searchType: 'keyword'
        },
        explanation: `Keyword search for "${keyword}"`,
        results: workers.slice(0, parseInt(limit)),
        totalFound: workers.length,
        searchMode: 'flexible',
        confidence: 50,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Keyword search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Keyword search failed',
      code: 'KEYWORD_SEARCH_ERROR'
    });
  }
}

/**
 * Rank workers based on multiple factors
 */
function rankWorkers(workers, enhancedQuery, userLat, userLng) {
  if (!workers || workers.length === 0) return [];

  // Calculate scores for each worker
  const scored = workers.map(worker => {
    let score = 0;

    // Distance score (closer = better)
    if (worker.location && worker.location.coordinates) {
      const [workerLng, workerLat] = worker.location.coordinates;
      const distance = calculateDistance(userLat, userLng, workerLat, workerLng);
      score += Math.max(0, 100 - distance * 2); // Max 100, decreases with distance
    }

    // Rating score
    score += (worker.averageRating || 0) * 10; // Max 50

    // Experience score
    score += Math.min(worker.experienceYears || 0, 5) * 8; // Max 40

    // Reviews count score
    score += Math.min((worker.totalReviews || 0) / 10, 10); // Max 10

    // Priority based on search intent
    if (enhancedQuery.prioritizeBy === 'rating' && (worker.averageRating || 0) >= 4.5) {
      score += 20;
    } else if (enhancedQuery.prioritizeBy === 'price' && (worker.hourlyRate || 0) <= 300) {
      score += 20;
    } else if (enhancedQuery.prioritizeBy === 'availability' && worker.availability === 'available') {
      score += 30;
    }

    return {
      ...worker,
      relevanceScore: Math.round(score),
      searchMetadata: {
        distance: worker.location ? calculateDistance(userLat, userLng, worker.location.coordinates[1], worker.location.coordinates[0]) : null,
        priorityReason: enhancedQuery.prioritizeBy
      }
    };
  });

  // Sort by relevance score descending
  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get query suggestions based on user's partial input
 * GET /api/search/ai-suggestions
 */
async function getAISuggestions(req, res) {
  try {
    const { partial, latitude, longitude } = req.query;

    if (!partial || partial.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    // Get available services
    const services = await Worker.distinct('serviceCategories', { isApproved: true, isActive: true });

    // Filter services matching partial input
    const matchedServices = services.filter(service =>
      service.toLowerCase().includes(partial.toLowerCase())
    );

    // Generate suggestions
    const suggestions = [
      ...matchedServices.map(service => `Find me a ${service}`),
      ...matchedServices.map(service => `I need a ${service}`),
      `${partial} near me`,
      `Experienced ${partial}`,
      `Affordable ${partial}`
    ].slice(0, 5);

    res.json({
      success: true,
      suggestions,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get search history and trending queries
 * GET /api/search/trending
 */
async function getTrendingQueries(req, res) {
  try {
    // This would require storing search queries in database
    // For now, return common query patterns
    
    const commonQueries = [
      'Find a plumber near me',
      'I need an electrician',
      'Affordable carpenter in my area',
      'Experienced AC repair worker',
      'Urgent plumber service',
      'Best rated painter nearby',
      'Budget-friendly cleaner'
    ];

    res.json({
      success: true,
      trending: commonQueries,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Trending queries error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  aiPoweredSearch,
  getAISuggestions,
  getTrendingQueries,
  performSemanticSearch,
  rankWorkers,
  calculateDistance
};
