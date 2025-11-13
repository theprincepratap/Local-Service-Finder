/**
 * WORKER DASHBOARD ROUTES
 * All routes require worker authentication
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getDashboardStats,
  getPendingRequests,
  getTodaySchedule,
  getActiveJobs,
  getJobHistory,
  getWorkerReviews,
  getEarningsDetails
} = require('../controllers/workerDashboard.controller');

// All routes require authentication and worker role
router.use(protect);
router.use(authorize('worker'));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// Pending requests
router.get('/pending-requests', getPendingRequests);

// Today's schedule
router.get('/schedule', getTodaySchedule);

// Active jobs
router.get('/active-jobs', getActiveJobs);

// Job history
router.get('/job-history', getJobHistory);

// Reviews
router.get('/reviews', getWorkerReviews);

// Earnings
router.get('/earnings', getEarningsDetails);

module.exports = router;
