const express = require('express');
const router = express.Router();
const {
  registerWorker,
  getNearbyWorkers,
  getWorkerById,
  updateWorkerProfile,
  updateAvailability,
  getDashboardStats
} = require('../controllers/worker.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/nearby', getNearbyWorkers);
router.get('/:id', getWorkerById);

// Protected routes
router.post('/register', protect, registerWorker);
router.put('/profile', protect, authorize('worker'), updateWorkerProfile);
router.put('/availability', protect, authorize('worker'), updateAvailability);
router.get('/dashboard/stats', protect, authorize('worker'), getDashboardStats);

module.exports = router;
