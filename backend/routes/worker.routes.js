const express = require('express');
const router = express.Router();
const {
  registerWorker,
  getNearbyWorkers,
  getWorkerById,
  getWorkerProfile,
  updateWorkerProfile,
  uploadProfileImage,
  uploadWorkerDocument,
  updateAvailability,
  getDashboardStats
} = require('../controllers/worker.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadImage, uploadDocument } = require('../middleware/upload');

// Public routes
router.get('/nearby', getNearbyWorkers);

// Protected routes - MUST come BEFORE /:id route
router.post('/register', protect, registerWorker);
router.get('/profile', protect, authorize('worker'), getWorkerProfile);
router.put('/profile', protect, authorize('worker'), updateWorkerProfile);
router.post('/profile/image', protect, authorize('worker'), uploadImage.single('profileImage'), uploadProfileImage);
router.post('/profile/document', protect, authorize('worker'), uploadDocument.single('document'), uploadWorkerDocument);
router.put('/availability', protect, authorize('worker'), updateAvailability);
router.get('/dashboard/stats', protect, authorize('worker'), getDashboardStats);

// Dynamic routes - MUST come AFTER specific routes
router.get('/:id', getWorkerById);

module.exports = router;
