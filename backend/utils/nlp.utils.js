/**
 * NLP QUERY PROCESSOR - AI-POWERED SEARCH
 * Converts conversational queries into structured search parameters
 * Uses natural language processing to understand user intent
 */

// Service synonyms and keywords mapping
const SERVICE_SYNONYMS = {
  // Plumbing services
  'plumber': ['plumber', 'plumbing', 'pipe', 'pipes', 'leak', 'leaking', 'drain', 'unclog', 'faucet', 'tap'],
  'electrician': ['electrician', 'electrical', 'wiring', 'wire', 'switch', 'fan', 'light', 'power', 'socket', 'outlet'],
  'carpenter': ['carpenter', 'carpentry', 'wood work', 'furniture', 'cabinet', 'shelf', 'door', 'frame'],
  'painter': ['painter', 'painting', 'paint', 'wall', 'interior', 'exterior', 'color', 'decorative'],
  'ac-repair': ['ac', 'air conditioner', 'cooler', 'cooling', 'hvac', 'air conditioning', 'refrigerant'],
  'appliance-repair': ['appliance', 'refrigerator', 'washing machine', 'microwave', 'oven', 'dishwasher'],
  'cleaner': ['cleaner', 'cleaning', 'maid', 'housekeeping', 'sweep', 'mop', 'dust', 'sanitize'],
  'gardener': ['gardener', 'garden', 'landscaping', 'lawn', 'plants', 'trees', 'flowers', 'maintenance'],
  'pest-control': ['pest control', 'termite', 'cockroach', 'ant', 'mosquito', 'exterminator'],
  'driver': ['driver', 'driving', 'cab', 'taxi', 'transport', 'chauffeur', 'delivery'],
  'tutor': ['tutor', 'tutoring', 'coaching', 'lessons', 'teaching', 'education', 'classes'],
  'beauty': ['beauty', 'salon', 'hair', 'makeup', 'facial', 'spa', 'massage', 'styling']
};

// Experience level keywords
const EXPERIENCE_LEVELS = {
  'beginner': { min: 0, max: 2, keywords: ['beginner', 'fresher', 'new', 'just starting', 'starting out'] },
  'intermediate': { min: 2, max: 5, keywords: ['experienced', 'intermediate', 'few years', '2-5 years', 'moderate'] },
  'expert': { min: 5, max: 100, keywords: ['expert', 'professional', 'highly experienced', '5+ years', 'master', 'veteran', 'professional'] }
};

// Availability keywords
const AVAILABILITY_KEYWORDS = {
  'available': ['available now', 'urgent', 'asap', 'immediately', 'right now', 'today'],
  'busy': ['busy', 'not available', 'booked', 'occupied', 'not free'],
  'offline': ['offline', 'not available', 'away']
};

// Intent detection keywords
const INTENT_KEYWORDS = {
  'emergency': ['urgent', 'emergency', 'asap', 'immediately', 'broken', 'not working', 'damaged', 'leak', 'fire'],
  'budget': ['cheap', 'affordable', 'budget', 'inexpensive', 'low cost', 'less than', 'max price'],
  'quality': ['best', 'top rated', 'highest rated', 'excellent', 'premium', 'quality'],
  'reliability': ['reliable', 'trustworthy', 'professional', 'experienced', 'verified'],
  'location': ['nearby', 'close to', 'near', 'next to', 'close by', 'within', 'distance']
};

// Indian Cities and Areas (Major locations)
const INDIAN_LOCATIONS = {
  // Karnataka - Bangalore
  'bangalore': ['bangalore', 'bengaluru', 'blr', 'koramangala', 'indiranagar', 'whitefield', 'hsr layout', 'marathahalli', 'btm layout', 'jayanagar', 'malleshwaram', 'electronic city', 'yelahanka', 'rajajinagar', 'jp nagar', 'banashankari'],
  
  // Delhi NCR
  'delhi': ['delhi', 'new delhi', 'connaught place', 'karol bagh', 'dwarka', 'rohini', 'pitampura', 'saket', 'nehru place', 'lajpat nagar'],
  'noida': ['noida', 'greater noida', 'sector', 'noida extension'],
  'gurgaon': ['gurgaon', 'gurugram', 'cyber city', 'mg road', 'sohna road', 'golf course road'],
  'faridabad': ['faridabad', 'ballabgarh'],
  'ghaziabad': ['ghaziabad', 'vaishali', 'indirapuram'],
  
  // Maharashtra - Mumbai
  'mumbai': ['mumbai', 'bombay', 'andheri', 'bandra', 'borivali', 'goregaon', 'malad', 'powai', 'vikhroli', 'dadar', 'kurla', 'mulund', 'thane', 'navi mumbai', 'vashi', 'nerul'],
  'pune': ['pune', 'pimpri', 'chinchwad', 'kothrud', 'hinjewadi', 'wakad', 'aundh', 'viman nagar', 'hadapsar'],
  
  // Tamil Nadu
  'chennai': ['chennai', 'madras', 't nagar', 'adyar', 'velachery', 'tambaram', 'porur', 'anna nagar', 'mylapore'],
  
  // Telangana
  'hyderabad': ['hyderabad', 'secunderabad', 'gachibowli', 'hitech city', 'madhapur', 'kukatpally', 'miyapur', 'ameerpet', 'begumpet'],
  
  // Kerala
  'kochi': ['kochi', 'cochin', 'ernakulam', 'kakkanad', 'edappally'],
  'trivandrum': ['trivandrum', 'thiruvananthapuram'],
  
  // Gujarat
  'ahmedabad': ['ahmedabad', 'amdavad', 'satellite', 'sg highway', 'vastrapur'],
  
  // West Bengal
  'kolkata': ['kolkata', 'calcutta', 'salt lake', 'howrah', 'ballygunge', 'park street'],
  
  // Rajasthan
  'jaipur': ['jaipur', 'pink city', 'malviya nagar', 'vaishali nagar'],
  
  // Uttar Pradesh
  'lucknow': ['lucknow', 'gomti nagar', 'hazratganj'],
  'kanpur': ['kanpur'],
  
  // Other major cities
  'chandigarh': ['chandigarh', 'mohali', 'panchkula'],
  'indore': ['indore'],
  'bhopal': ['bhopal'],
  'coimbatore': ['coimbatore'],
  'visakhapatnam': ['vizag', 'visakhapatnam'],
  'vadodara': ['vadodara', 'baroda'],
  'nagpur': ['nagpur'],
  'surat': ['surat']
};

// Price range patterns
const PRICE_PATTERNS = {
  affordable: { max: 300 },
  budget: { max: 500 },
  mid_range: { max: 1000 },
  premium: { max: 5000 }
};

/**
 * Parse natural language query into structured parameters
 * @param {string} query - User's natural language query
 * @returns {Object} Parsed search parameters
 */
function parseNaturalQuery(query) {
  const lowerQuery = query.toLowerCase();
  const result = {
    services: [],
    location: null,
    maxPrice: null,
    minExperience: 0,
    availability: 'all',
    urgency: 'normal',
    intent: [],
    confidence: 0,
    originalQuery: query
  };

  // Extract services using synonyms
  for (const [service, keywords] of Object.entries(SERVICE_SYNONYMS)) {
    const found = keywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    if (found) {
      result.services.push(service);
    }
  }

  // Extract experience level
  for (const [level, data] of Object.entries(EXPERIENCE_LEVELS)) {
    const found = data.keywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    if (found) {
      result.minExperience = data.min;
      break;
    }
  }

  // Extract availability
  for (const [avail, keywords] of Object.entries(AVAILABILITY_KEYWORDS)) {
    const found = keywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    if (found) {
      result.availability = avail;
      break;
    }
  }

  // Extract intent
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    const found = keywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    if (found) {
      result.intent.push(intent);
      if (intent === 'emergency') {
        result.urgency = 'high';
      }
    }
  }

  // Extract price information
  const priceMatch = lowerQuery.match(/(\d+)\s*(?:rs|rupees?|₹)?/);
  if (priceMatch) {
    result.maxPrice = parseInt(priceMatch[1]);
  } else {
    // Check for price range keywords
    for (const [range, data] of Object.entries(PRICE_PATTERNS)) {
      if (lowerQuery.includes(range)) {
        result.maxPrice = data.max;
        break;
      }
    }
  }

  // Extract location keywords
  const locationMatch = lowerQuery.match(/(?:in|at|near|around|at|location:)\s+([a-zA-Z\s]+?)(?:\s+(?:and|or|with|to|for)|\.|$)/);
  if (locationMatch) {
    result.location = locationMatch[1].trim();
  }

  // Calculate confidence score
  let confidence = 0;
  if (result.services.length > 0) confidence += 25;
  if (result.maxPrice) confidence += 20;
  if (result.location) confidence += 20;
  if (result.intent.length > 0) confidence += 20;
  if (result.minExperience > 0) confidence += 15;

  result.confidence = Math.min(confidence, 100);

  return result;
}

/**
 * Extract location from query with AI-powered city/area recognition
 * @param {string} query - User query
 * @returns {string|null} Extracted location
 */
function extractLocation(query) {
  const lowerQuery = query.toLowerCase();
  
  // First, check for known Indian cities/areas
  for (const [city, keywords] of Object.entries(INDIAN_LOCATIONS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        console.log(`📍 Detected location: ${city} (matched: ${keyword})`);
        return keyword; // Return the actual matched keyword (e.g., "koramangala" instead of "bangalore")
      }
    }
  }
  
  // Common location patterns
  const patterns = [
    /(?:in|at|near|around|location:|from)\s+([a-zA-Z\s]+?)(?:\s+(?:and|or|with|to|for|who|that|which)|\.|,|$)/i,
    /([a-zA-Z\s]+?)\s+(?:area|locality|sector|road|nagar|layout|extension|colony)/i,
    /(?:around|near|close to)\s+([a-zA-Z\s]+?)(?:\s|$)/i,
    /(?:within|in)\s+([a-zA-Z\s]+?)(?:\s+(?:radius|km|kilometer))?/i
  ];

  for (const pattern of patterns) {
    const match = lowerQuery.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      // Filter out common words that aren't locations
      const nonLocationWords = ['need', 'want', 'looking', 'find', 'search', 'get', 'hire', 'book', 'service', 'worker'];
      if (!nonLocationWords.includes(location)) {
        console.log(`📍 Extracted location from pattern: ${location}`);
        return location;
      }
    }
  }

  return null;
}

/**
 * Enhance query with semantic understanding
 * @param {Object} parsedQuery - Parsed query object
 * @returns {Object} Enhanced query with additional context
 */
function enhanceQuery(parsedQuery) {
  const enhanced = { ...parsedQuery };

  // Add complementary services based on primary service
  if (parsedQuery.services.includes('electrician')) {
    enhanced.relatedServices = ['ac-repair', 'appliance-repair'];
  } else if (parsedQuery.services.includes('plumber')) {
    enhanced.relatedServices = ['carpenter']; // For fixtures
  } else if (parsedQuery.services.includes('painter')) {
    enhanced.relatedServices = ['carpenter']; // For wall prep
  }

  // Adjust priority based on intent
  enhanced.prioritizeBy = 'distance'; // default
  if (parsedQuery.intent.includes('quality')) {
    enhanced.prioritizeBy = 'rating';
  } else if (parsedQuery.intent.includes('budget')) {
    enhanced.prioritizeBy = 'price';
  } else if (parsedQuery.intent.includes('emergency')) {
    enhanced.prioritizeBy = 'availability';
  }

  // Set search strictness based on confidence
  enhanced.searchMode = parsedQuery.confidence > 75 ? 'strict' : 'flexible';

  return enhanced;
}

/**
 * Generate readable explanation of parsed query
 * @param {Object} parsedQuery - Parsed query object
 * @returns {string} Human-readable explanation
 */
function generateExplanation(parsedQuery) {
  const parts = [];

  if (parsedQuery.services.length > 0) {
    parts.push(`Looking for ${parsedQuery.services.join(', ')}`);
  }

  if (parsedQuery.location) {
    parts.push(`in ${parsedQuery.location}`);
  }

  if (parsedQuery.minExperience > 0) {
    const level = parsedQuery.minExperience < 3 ? 'intermediate' : 'experienced';
    parts.push(`${level} workers`);
  }

  if (parsedQuery.maxPrice) {
    parts.push(`max ₹${parsedQuery.maxPrice}/hour`);
  }

  if (parsedQuery.urgency === 'high') {
    parts.push(`(urgent)`);
  }

  return parts.join(' • ');
}

/**
 * Convert parsed query to search API parameters
 * @param {Object} parsedQuery - Parsed query object
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {Object} API search parameters
 */
function convertToSearchParams(parsedQuery, latitude, longitude) {
  const params = {
    latitude,
    longitude,
    categories: parsedQuery.services.length > 0 ? parsedQuery.services : undefined,
    maxPrice: parsedQuery.maxPrice,
    minExperience: parsedQuery.minExperience,
    availability: parsedQuery.availability,
    sortBy: parsedQuery.prioritizeBy || 'distance',
    limit: parsedQuery.urgency === 'high' ? 10 : 20,
    keyword: parsedQuery.location
  };

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  );
}

module.exports = {
  parseNaturalQuery,
  extractLocation,
  enhanceQuery,
  generateExplanation,
  convertToSearchParams,
  SERVICE_SYNONYMS,
  EXPERIENCE_LEVELS,
  AVAILABILITY_KEYWORDS,
  INTENT_KEYWORDS,
  PRICE_PATTERNS
};
