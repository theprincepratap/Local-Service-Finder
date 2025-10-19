const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getWorkerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
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

module.exports = router;
