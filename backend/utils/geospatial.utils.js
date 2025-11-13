/**
 * LOCATION-BASED WORKER SEARCH - DSA ALGORITHMS GUIDE
 * 
 * This system uses geospatial indexing and distance calculations
 * to match users with nearby workers efficiently.
 */

// ============================================================
// 1. HAVERSINE FORMULA - Calculate Distance Between Two Points
// ============================================================

/**
 * Calculates the great-circle distance between two points 
 * on Earth using the Haversine formula
 * 
 * @param {number} lat1 - User's latitude
 * @param {number} lon1 - User's longitude
 * @param {number} lat2 - Worker's latitude
 * @param {number} lon2 - Worker's longitude
 * @returns {number} - Distance in kilometers
 * 
 * Time Complexity: O(1) - Constant time
 * Space Complexity: O(1) - No extra space
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  // Haversine formula
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// ============================================================
// 2. BOUNDING BOX ALGORITHM - Reduce Search Space
// ============================================================

/**
 * Calculates a bounding box (rectangle) around a point
 * This reduces the search space before calculating exact distances
 * Useful for filtering candidates before expensive calculations
 * 
 * @param {number} lat - Center latitude
 * @param {number} lon - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {object} - Bounding box with lat/lon ranges
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
export function calculateBoundingBox(lat, lon, radiusKm) {
  // 1 degree of latitude ≈ 111 km
  const latChange = radiusKm / 111;
  
  // 1 degree of longitude varies by latitude
  const lonChange = radiusKm / (111 * Math.cos(toRad(lat)));

  return {
    minLat: lat - latChange,
    maxLat: lat + latChange,
    minLon: lon - lonChange,
    maxLon: lon + lonChange
  };
}

// ============================================================
// 3. SORTING ALGORITHMS - Sort Workers by Distance
// ============================================================

/**
 * Sorts workers by distance from user
 * Uses efficient comparison sorting
 * 
 * @param {Array} workers - Array of worker objects with location
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @returns {Array} - Sorted workers (closest first)
 * 
 * Time Complexity: O(n log n) - Merge/Quick sort
 * Space Complexity: O(n) - For sorted array
 */
export function sortWorkersByDistance(workers, userLat, userLon) {
  return workers
    .map(worker => ({
      ...worker,
      distance: calculateHaversineDistance(
        userLat,
        userLon,
        worker.location.coordinates[1], // latitude
        worker.location.coordinates[0]  // longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}

// ============================================================
// 4. FILTERING ALGORITHM - Filter by Multiple Criteria
// ============================================================

/**
 * Filters workers using multiple criteria
 * Implements multi-dimensional filtering
 * 
 * @param {Array} workers - Array of workers
 * @param {object} filters - Filter criteria
 * @returns {Array} - Filtered workers
 * 
 * Time Complexity: O(n * m) where m is number of filter criteria
 * Space Complexity: O(k) where k is number of results
 */
export function filterWorkers(workers, filters) {
  return workers.filter(worker => {
    // Distance filter
    if (filters.maxDistance && worker.distance > filters.maxDistance) {
      return false;
    }

    // Rating filter (minimum rating)
    if (filters.minRating && worker.rating < filters.minRating) {
      return false;
    }

    // Price filter (maximum price per hour)
    if (filters.maxPrice && worker.pricePerHour > filters.maxPrice) {
      return false;
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      const hasCategory = worker.categories.some(cat =>
        filters.categories.includes(cat)
      );
      if (!hasCategory) {
        return false;
      }
    }

    // Experience filter
    if (filters.minExperience && worker.experience < filters.minExperience) {
      return false;
    }

    // Availability filter
    if (filters.availability && worker.availability !== filters.availability) {
      return false;
    }

    // Approval status (only approved workers)
    if (worker.approvalStatus !== 'approved') {
      return false;
    }

    return true;
  });
}

// ============================================================
// 5. RANKING ALGORITHM - Calculate Match Score
// ============================================================

/**
 * Calculates a match score for each worker
 * Higher score = better match
 * 
 * Scoring factors:
 * - Distance (40%) - Closer is better
 * - Rating (35%) - Higher rating is better
 * - Experience (15%) - More experience is better
 * - Price competitiveness (10%) - Fair price is better
 * 
 * @param {object} worker - Worker object
 * @param {object} criteria - Search criteria
 * @returns {number} - Match score (0-100)
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
export function calculateMatchScore(worker, criteria) {
  let score = 0;

  // Distance score (40%)
  const maxDistance = criteria.maxDistance || 50; // 50 km default
  const distanceScore = Math.max(0, 100 * (1 - worker.distance / maxDistance));
  score += distanceScore * 0.4;

  // Rating score (35%)
  const ratingScore = (worker.rating / 5) * 100;
  score += ratingScore * 0.35;

  // Experience score (15%)
  const maxExperience = 20;
  const experienceScore = Math.min(100, (worker.experience / maxExperience) * 100);
  score += experienceScore * 0.15;

  // Price competitiveness score (10%)
  const avgPrice = criteria.avgPrice || 500; // Default average price
  const priceScore = Math.max(0, 100 * (1 - Math.abs(worker.pricePerHour - avgPrice) / avgPrice));
  score += priceScore * 0.1;

  return Math.round(score);
}

// ============================================================
// 6. BINARY SEARCH - Find Workers in Price Range
// ============================================================

/**
 * Binary search to find workers in a specific price range
 * Workers array must be sorted by price
 * 
 * @param {Array} workers - Sorted array of workers by price
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Array} - Workers within price range
 * 
 * Time Complexity: O(log n + k) where k is result count
 * Space Complexity: O(k)
 */
export function findWorkersByPriceRange(workers, minPrice, maxPrice) {
  // Find first worker >= minPrice
  let left = 0,
    right = workers.length - 1;
  let startIdx = workers.length;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (workers[mid].pricePerHour >= minPrice) {
      startIdx = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // Find all workers up to maxPrice
  const result = [];
  for (let i = startIdx; i < workers.length && workers[i].pricePerHour <= maxPrice; i++) {
    result.push(workers[i]);
  }

  return result;
}

// ============================================================
// 7. GEOGRAPHIC INDEXING - MongoDB GeoJSON Queries
// ============================================================

/**
 * MongoDB GeoJSON Query for finding nearby workers
 * Uses 2dsphere index for efficient geospatial queries
 * 
 * Query Structure:
 * {
 *   location: {
 *     $near: {
 *       $geometry: {
 *         type: 'Point',
 *         coordinates: [longitude, latitude]
 *       },
 *       $maxDistance: 5000 (in meters),
 *       $minDistance: 0 (in meters)
 *     }
 *   }
 * }
 * 
 * Time Complexity: O(log n) - Index lookup
 * Space Complexity: O(1) - Returns references only
 * 
 * MongoDB automatically:
 * 1. Uses geospatial index for efficient lookup
 * 2. Calculates distances using Haversine formula
 * 3. Returns results sorted by distance
 */

// ============================================================
// 8. CACHING STRATEGY - Optimize Repeated Searches
// ============================================================

/**
 * Simple in-memory cache for search results
 * Stores results for quick retrieval on repeated searches
 * 
 * Time Complexity: O(1) - Hash map lookup
 * Space Complexity: O(n) - Stores cached results
 */
export class SearchCache {
  constructor(ttl = 300000) { // 5 minutes TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Generate cache key from search parameters
   */
  generateKey(userLat, userLon, filters) {
    return `${userLat.toFixed(4)}_${userLon.toFixed(4)}_${JSON.stringify(filters)}`;
  }

  /**
   * Get cached results
   */
  get(userLat, userLon, filters) {
    const key = this.generateKey(userLat, userLon, filters);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if cache expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache
   */
  set(userLat, userLon, filters, data) {
    const key = this.generateKey(userLat, userLon, filters);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size to 100 entries
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }
}

// ============================================================
// 9. ALGORITHM COMPLEXITY SUMMARY
// ============================================================

/**
 * Algorithm Complexities:
 * 
 * 1. Haversine Distance: O(1) time, O(1) space
 * 2. Bounding Box: O(1) time, O(1) space
 * 3. Sort by Distance: O(n log n) time, O(n) space
 * 4. Filter Workers: O(n * m) time, O(k) space
 * 5. Match Score: O(1) time, O(1) space
 * 6. Binary Search Price: O(log n + k) time, O(k) space
 * 7. MongoDB GeoQuery: O(log n) time, O(1) space
 * 8. Search Cache: O(1) time, O(n) space
 * 
 * Overall Search Flow:
 * 1. MongoDB GeoQuery: O(log n) - Get candidates
 * 2. Filter: O(k * m) - Apply filters
 * 3. Score: O(k) - Calculate match scores
 * 4. Sort: O(k log k) - Sort results
 * Total: O(log n + k log k) where k << n
 */

// ============================================================
// 10. USAGE EXAMPLE
// ============================================================

/**
 * Example Usage:
 * 
 * const userLat = 28.6139;
 * const userLon = 77.2090;
 * 
 * const filters = {
 *   maxDistance: 10, // km
 *   maxPrice: 1000,
 *   minRating: 4,
 *   categories: ['Plumber', 'Electrician'],
 *   minExperience: 2
 * };
 * 
 * // Backend will:
 * 1. Use MongoDB $near query to get candidates
 * 2. Filter by criteria
 * 3. Calculate match scores
 * 4. Return sorted results
 * 
 * // Frontend caches results for 5 minutes
 */

export default {
  calculateHaversineDistance,
  calculateBoundingBox,
  sortWorkersByDistance,
  filterWorkers,
  calculateMatchScore,
  findWorkersByPriceRange,
  SearchCache
};
