/**
 * ADDRESS PARSING UTILITY
 * Extracts components from detected address string
 * 
 * Example Input:
 * "Vandalur - Mambakkam - Kelambakkam Road, Kolapakkam, Tirupporur, Chengalpattu, Tamil Nadu, 600127, India"
 * 
 * Example Output:
 * {
 *   fullAddress: "Vandalur - Mambakkam - Kelambakkam Road, Kolapakkam, Tirupporur, Chengalpattu, Tamil Nadu, 600127, India",
 *   street: "Vandalur - Mambakkam - Kelambakkam Road",
 *   area: "Kolapakkam",
 *   city: "Tirupporur",
 *   district: "Chengalpattu",
 *   state: "Tamil Nadu",
 *   pincode: "600127",
 *   country: "India"
 * }
 */

/**
 * Parse detected address string and extract components
 * @param {string} detectedAddress - Full address string from geolocation API
 * @returns {object} - Parsed address components
 */
function parseDetectedAddress(detectedAddress) {
  if (!detectedAddress || typeof detectedAddress !== 'string') {
    return {
      fullAddress: detectedAddress || 'Unknown Location',
      street: '',
      area: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: ''
    };
  }

  // Split address by comma
  const parts = detectedAddress.split(',').map(p => p.trim());
  
  const parsed = {
    fullAddress: detectedAddress,
    street: '',
    area: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: ''
  };

  if (parts.length > 0) parsed.street = parts[0];      // First part: street/road
  if (parts.length > 1) parsed.area = parts[1];         // Second part: area/locality
  if (parts.length > 2) parsed.city = parts[2];         // Third part: city/town
  if (parts.length > 3) parsed.district = parts[3];     // Fourth part: district
  if (parts.length > 4) parsed.state = parts[4];        // Fifth part: state
  
  // Extract pincode (usually 6 digits in India)
  const pincodeMatch = detectedAddress.match(/\b\d{5,6}\b/);
  if (pincodeMatch) {
    parsed.pincode = pincodeMatch[0];
  }
  
  // Extract country (usually last part after pincode)
  if (parts.length > 5) {
    // Look for country-like strings
    const lastParts = parts.slice(-2);
    const countryPart = lastParts.find(p => /^[A-Z][a-z]+$/.test(p) || p.length > 3);
    if (countryPart) {
      parsed.country = countryPart;
    }
  }

  return parsed;
}

/**
 * Extract keywords from parsed address for text search
 * @param {object} parsedAddress - Parsed address components
 * @returns {object} - Location keywords
 */
function extractKeywords(parsedAddress) {
  return {
    street: parsedAddress.street || '',
    area: parsedAddress.area || '',
    city: parsedAddress.city || '',
    district: parsedAddress.district || '',
    state: parsedAddress.state || '',
    pincode: parsedAddress.pincode || '',
    country: parsedAddress.country || '',
    // Concatenate for combined search
    fullAddress: parsedAddress.fullAddress || ''
  };
}

/**
 * Format location data for database storage
 * @param {object} locationData - Location data from frontend
 * @returns {object} - Formatted location object for database
 */
function formatLocationForDatabase(locationData) {
  if (!locationData || !locationData.detectedAddress) {
    return {
      type: 'Point',
      coordinates: [0, 0],
      address: 'Not set',
      detectedAddress: 'Not set',
      parsedAddress: {},
      keywords: {}
    };
  }

  const {
    latitude,
    longitude,
    detectedAddress,
    accuracy
  } = locationData;

  // Parse the detected address
  const parsedAddress = parseDetectedAddress(detectedAddress);
  
  // Extract keywords
  const keywords = extractKeywords(parsedAddress);

  return {
    type: 'Point',
    coordinates: [longitude, latitude],           // GeoJSON format: [lon, lat]
    address: detectedAddress,                      // Full detected address
    detectedAddress: detectedAddress,              // Store original detected address
    accuracy: accuracy || null,                    // Location accuracy in meters
    capturedAt: new Date(),                        // When it was captured
    
    // Parsed components for easier querying
    parsedAddress: {
      street: parsedAddress.street,
      area: parsedAddress.area,
      city: parsedAddress.city,
      district: parsedAddress.district,
      state: parsedAddress.state,
      pincode: parsedAddress.pincode,
      country: parsedAddress.country
    },
    
    // Keywords for text search (denormalized for performance)
    keywords: keywords
  };
}

module.exports = {
  parseDetectedAddress,
  extractKeywords,
  formatLocationForDatabase
};
