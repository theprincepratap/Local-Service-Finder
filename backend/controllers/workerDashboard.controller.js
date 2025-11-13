/**
 * WORKER DASHBOARD CONTROLLER
 * Provides real data from MongoDB for worker dashboard
 */

const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');
const WorkerUser = require('../models/WorkerUser.model');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get worker dashboard statistics
// @route   GET /api/worker/dashboard/stats
// @access  Private (Worker only)
exports.getDashboardStats = async (req, res) => {
  try {
    const workerId = req.user._id;

    // User is already a WorkerUser (authenticated via WorkerUser collection)
    // No need to find separately, req.user IS the worker
    const worker = req.user;

    // 1. Get total earnings (sum of completed bookings)
    const earningsData = await Booking.aggregate([
      {
        $match: {
          workerId: worker._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$workerEarning' },
          completedJobs: { $sum: 1 }
        }
      }
    ]);

    const totalEarnings = earningsData[0]?.totalEarnings || 0;
    const completedJobs = earningsData[0]?.completedJobs || 0;

    // 2. Get active jobs (pending, accepted, on-the-way, in-progress)
    const activeJobs = await Booking.countDocuments({
      workerId: worker._id,
      status: {
        $in: ['pending', 'accepted', 'on-the-way', 'in-progress']
      }
    });

    // 3. Get average rating from WorkerUser model (fallback to worker's own rating)
    const ratingData = await Review.aggregate([
      {
        $match: { workerId: worker._id }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // Use WorkerUser's rating if no reviews exist yet
    const averageRating = ratingData[0]?.averageRating || worker.rating || 0;
    const totalReviews = ratingData[0]?.totalReviews || 0;

    // 4. Get this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthEarningsData = await Booking.aggregate([
      {
        $match: {
          workerId: worker._id,
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          monthEarnings: { $sum: '$workerEarning' }
        }
      }
    ]);

    const monthEarnings = monthEarningsData[0]?.monthEarnings || 0;

    // 5. Earnings trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const earningsTrend = await Booking.aggregate([
      {
        $match: {
          workerId: worker._id,
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          earnings: { $sum: '$workerEarning' },
          jobs: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const stats = {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      monthEarnings: Math.round(monthEarnings * 100) / 100,
      activeJobs,
      completedJobs,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      earningsTrend
    };

    successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get pending job requests
// @route   GET /api/worker/dashboard/pending-requests
// @access  Private (Worker only)
exports.getPendingRequests = async (req, res) => {
  try {
    const workerId = req.user._id;
    const worker = req.user; // User is already a WorkerUser

    const pendingRequests = await Booking.find({
      workerId: worker._id,
      status: 'pending'
    })
      .populate('userId', 'name phone email profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    successResponse(res, pendingRequests, 'Pending requests retrieved successfully');
  } catch (error) {
    console.error('Pending requests error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get today's schedule
// @route   GET /api/worker/dashboard/schedule
// @access  Private (Worker only)
exports.getTodaySchedule = async (req, res) => {
  try {
    const workerId = req.user._id;
    const worker = req.user; // User is already a WorkerUser

    // Get bookings for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedule = await Booking.find({
      workerId: worker._id,
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: {
        $in: ['accepted', 'on-the-way', 'in-progress']
      }
    })
      .populate('userId', 'name phone email')
      .sort({ scheduledTime: 1 });

    successResponse(res, schedule, 'Today\'s schedule retrieved successfully');
  } catch (error) {
    console.error('Schedule error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get active jobs
// @route   GET /api/worker/dashboard/active-jobs
// @access  Private (Worker only)
exports.getActiveJobs = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const worker = req.user; // User is already a WorkerUser

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activeJobs = await Booking.find({
      workerId: worker._id,
      status: {
        $in: ['pending', 'accepted', 'on-the-way', 'in-progress']
      }
    })
      .populate('userId', 'name phone email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({
      workerId: worker._id,
      status: {
        $in: ['pending', 'accepted', 'on-the-way', 'in-progress']
      }
    });

    successResponse(res, {
      jobs: activeJobs,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page)
      }
    }, 'Active jobs retrieved successfully');
  } catch (error) {
    console.error('Active jobs error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get job history
// @route   GET /api/worker/dashboard/job-history
// @access  Private (Worker only)
exports.getJobHistory = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;
    const worker = req.user; // User is already a WorkerUser

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { workerId: worker._id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const history = await Booking.find(query)
      .populate('userId', 'name phone email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    successResponse(res, {
      bookings: history,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page)
      }
    }, 'Job history retrieved successfully');
  } catch (error) {
    console.error('Job history error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get worker reviews
// @route   GET /api/worker/dashboard/reviews
// @access  Private (Worker only)
exports.getWorkerReviews = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const worker = req.user; // User is already a WorkerUser

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ workerId: worker._id })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ workerId: worker._id });

    successResponse(res, {
      reviews,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page)
      }
    }, 'Reviews retrieved successfully');
  } catch (error) {
    console.error('Reviews error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get earnings details
// @route   GET /api/worker/dashboard/earnings
// @access  Private (Worker only)
exports.getEarningsDetails = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { period = 'month' } = req.query; // day, week, month, year
    const worker = req.user; // User is already a WorkerUser

    let startDate;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setMonth(0);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(1);
    }

    const earningsData = await Booking.aggregate([
      {
        $match: {
          workerId: worker._id,
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          earnings: { $sum: '$workerEarning' },
          platformFee: { $sum: '$platformFee' },
          jobs: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalEarnings = earningsData.reduce((sum, item) => sum + item.earnings, 0);
    const totalFee = earningsData.reduce((sum, item) => sum + item.platformFee, 0);
    const totalJobs = earningsData.reduce((sum, item) => sum + item.jobs, 0);

    successResponse(res, {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalFee: Math.round(totalFee * 100) / 100,
      totalJobs,
      daily: earningsData
    }, 'Earnings details retrieved successfully');
  } catch (error) {
    console.error('Earnings error:', error);
    errorResponse(res, error, 500);
  }
};

module.exports = exports;
