const express = require('express');
const router = express.Router();
const {
  createReview,
  getWorkerReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  respondToReview,
  markHelpful,
  getReviewStats
} = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/worker/:workerId', getWorkerReviews);
router.get('/worker/:workerId/stats', getReviewStats);

// Protected routes
router.post('/', protect, createReview);
router.get('/user', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markHelpful);

// Worker routes
router.put('/:id/response', protect, authorize('worker'), respondToReview);

module.exports = router;
