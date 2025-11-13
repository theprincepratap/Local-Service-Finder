const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All admin routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/system/stats', adminController.getSystemStats);
router.get('/revenue/analytics', adminController.getRevenueAnalytics);

// User Management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Worker Management
router.get('/workers', adminController.getAllWorkers);
router.patch('/workers/:workerId/approve', adminController.approveWorker);
router.patch('/workers/:workerId/reject', adminController.rejectWorker);

// Booking Management
router.get('/bookings', adminController.getAllBookings);
router.patch('/bookings/:bookingId/status', adminController.updateBookingStatus);

// Review Management
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:reviewId', adminController.deleteReview);

module.exports = router;
