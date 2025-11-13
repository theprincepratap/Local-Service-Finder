const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getWorkerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  updateWorkerLocationForBooking,
  getWorkerLocationForBooking
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/worker-bookings', authorize('worker'), getWorkerBookings);
router.get('/:id', getBookingById);
router.put('/:id/status', authorize('worker'), updateBookingStatus);
router.put('/:id/cancel', cancelBooking);

// Real-time location tracking routes
router.put('/:id/worker-location', authorize('worker'), updateWorkerLocationForBooking);
router.get('/:id/worker-location', getWorkerLocationForBooking);

module.exports = router;
