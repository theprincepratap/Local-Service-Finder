const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getDashboardStats,
  getUserBookings,
  getRecentBookings,
  getNotifications,
  getUserReviews,
  searchWorkers,
  updateLocation,
  getLocationHistory
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected (require authentication)
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Location routes
router.put('/location', updateLocation);
router.get('/location/history', getLocationHistory);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/bookings', getUserBookings);
router.get('/bookings/recent', getRecentBookings);
router.get('/notifications', getNotifications);
router.get('/reviews', getUserReviews);

// Search routes
router.get('/search-workers', searchWorkers);

module.exports = router;

