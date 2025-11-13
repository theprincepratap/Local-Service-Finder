const express = require('express');
const router = express.Router();
const {
  searchNearbyWorkers,
  getWorkerWithDistance,
  getWorkerStats,
  getCategoriesStats
} = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * SEARCH ROUTES - Location-Based Worker Matching
 * 
 * These routes implement geospatial search algorithms
 * to find nearby workers based on user location
 */

// Public routes (no authentication required)
router.get('/categories/stats', getCategoriesStats);

// Protected routes (require authentication)
router.use(protect);

// Search nearby workers
// Query parameters:
// - latitude: User's latitude (required)
// - longitude: User's longitude (required)
// - maxDistance: Search radius in km (default: 15)
// - maxPrice: Maximum hourly rate (optional)
// - minRating: Minimum rating (default: 0)
// - categories: Service categories (comma-separated, optional)
// - minExperience: Minimum years of experience (default: 0)
// - availability: Filter by availability (all, available, busy, offline)
// - sortBy: Sort order (distance, rating, price, matchScore)
// - limit: Results per page (default: 20)
// - skip: Pagination offset (default: 0)
router.get('/nearby-workers', searchNearbyWorkers);

// Get specific worker with distance calculation
router.get('/worker/:id', getWorkerWithDistance);

// Get worker statistics
router.get('/worker-stats/:id', getWorkerStats);

module.exports = router;
