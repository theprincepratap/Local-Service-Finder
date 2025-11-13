/**
 * LOCATION ROUTES
 * Routes for handling location updates and queries
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  updateWorkerLocation,
  updateUserLocation,
  getUserLocationHistory,
  searchWorkersByLocationKeyword
} = require('../controllers/location.controller');

// ============================================
// WORKER LOCATION ROUTES
// ============================================

// Update worker location with detected address
router.put('/worker/location', protect, updateWorkerLocation);

// ============================================
// USER LOCATION ROUTES
// ============================================

// Update user location with detected address
router.put('/user/location', protect, updateUserLocation);

// Get user location history
router.get('/user/location-history', protect, getUserLocationHistory);

// ============================================
// SEARCH ROUTES
// ============================================

// Search workers by location keyword
router.get('/search-by-location-keyword', searchWorkersByLocationKeyword);

module.exports = router;
