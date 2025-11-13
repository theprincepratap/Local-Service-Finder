const User = require('../models/User.model');
const WorkerUser = require('../models/WorkerUser.model');
const Worker = require('../models/Worker.model');
const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');

// Get Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts from separate collections
    const totalUsers = await User.countDocuments();
    const totalWorkers = await WorkerUser.countDocuments();
    const pendingWorkers = await WorkerUser.countDocuments({ approvalStatus: 'pending' });
    const approvedWorkers = await WorkerUser.countDocuments({ approvalStatus: 'approved' });
    const rejectedWorkers = await WorkerUser.countDocuments({ approvalStatus: 'rejected' });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'in-progress' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalReviews = await Review.countDocuments();

    // Calculate revenue
    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageBooking: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const newWorkers = await WorkerUser.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Calculate average rating
    const ratingData = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Calculate booking success rate
    const bookingSuccessRate = totalBookings > 0 
      ? ((completedBookings / totalBookings) * 100).toFixed(1)
      : 0;

    // Calculate growth percentages (compare with previous 7 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const previousUsers = await User.countDocuments({ 
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });
    
    const previousWorkers = await WorkerUser.countDocuments({ 
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });

    const previousBookings = await Booking.countDocuments({ 
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo }
    });

    const userGrowth = previousUsers > 0 ? (((newUsers - previousUsers) / previousUsers) * 100).toFixed(1) : 0;
    const workerGrowth = previousWorkers > 0 ? (((newWorkers - previousWorkers) / previousWorkers) * 100).toFixed(1) : 0;
    const bookingGrowth = previousBookings > 0 ? (((totalBookings - previousBookings) / previousBookings) * 100).toFixed(1) : 0;

    // Get today's completed bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await Booking.countDocuments({ 
      status: 'completed',
      updatedAt: { $gte: today }
    });

    // Get new reviews count (last 7 days)
    const newReviews = await Review.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalWorkers,
        totalBookings,
        totalReviews,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        averageRevenue: revenueData[0]?.averageBooking || 0,
        pendingApprovals: pendingWorkers,
        activeWorkers: approvedWorkers,
        activeBookings,
        completedToday,
        newReviews,
        bookingSuccessRate: parseFloat(bookingSuccessRate),
        averageRating: ratingData[0]?.averageRating?.toFixed(1) || 0,
        userGrowth: parseFloat(userGrowth),
        workerGrowth: parseFloat(workerGrowth),
        bookingGrowth: parseFloat(bookingGrowth),
        revenueGrowth: 0, // Calculate if needed
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
};

// Get All Users with Pagination and Filters
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { role: 'user' };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get booking count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookingCount = await Booking.countDocuments({ userId: user._id });
        const totalSpent = await Booking.aggregate([
          { $match: { userId: user._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
          ...user.toObject(),
          stats: {
            bookingCount,
            totalSpent: totalSpent[0]?.total || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

// Get All Workers with Pagination and Filters
exports.getAllWorkers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      approvalStatus = 'all',
      category = 'all',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const workerQuery = {};

    // Search by name or email
    if (search) {
      workerQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by approval status
    if (approvalStatus !== 'all') {
      workerQuery.approvalStatus = approvalStatus;
    }

    // Filter by category
    if (category !== 'all') {
      workerQuery.categories = category;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const workers = await WorkerUser.find(workerQuery)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WorkerUser.countDocuments(workerQuery);

    // Get stats for each worker
    const workersWithStats = await Promise.all(
      workers.map(async (worker) => {
        const jobCount = await Booking.countDocuments({ workerId: worker._id });
        const completedJobs = await Booking.countDocuments({ 
          workerId: worker._id, 
          status: 'completed' 
        });
        const totalEarnings = await Booking.aggregate([
          { $match: { workerId: worker._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const reviewStats = await Review.aggregate([
          { $match: { workerId: worker._id } },
          { 
            $group: { 
              _id: null, 
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 }
            } 
          }
        ]);

        return {
          ...worker.toObject(),
          stats: {
            jobCount,
            completedJobs,
            totalEarnings: totalEarnings[0]?.total || 0,
            averageRating: reviewStats[0]?.averageRating || 0,
            totalReviews: reviewStats[0]?.totalReviews || 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        workers: workersWithStats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all workers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch workers',
      error: error.message 
    });
  }
};

// Approve Worker
exports.approveWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { message } = req.body;

    const worker = await WorkerUser.findById(workerId);
    if (!worker) {
      return res.status(404).json({ 
        success: false, 
        message: 'Worker not found' 
      });
    }

    worker.approvalStatus = 'approved';
    worker.isActive = true;
    worker.approvalMessage = message || 'Your application has been approved. You can now start accepting jobs.';
    worker.approvedAt = new Date();
    worker.approvedBy = req.user.id;

    await worker.save();

    res.json({
      success: true,
      message: 'Worker approved successfully',
      data: worker
    });
  } catch (error) {
    console.error('Approve worker error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve worker',
      error: error.message 
    });
  }
};

// Reject Worker
exports.rejectWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }

    const worker = await WorkerUser.findById(workerId);
    if (!worker) {
      return res.status(404).json({ 
        success: false, 
        message: 'Worker not found' 
      });
    }

    worker.approvalStatus = 'rejected';
    worker.isActive = false;
    worker.approvalMessage = reason;
    worker.rejectionReason = reason;
    worker.rejectedAt = new Date();
    worker.rejectedBy = req.user.id;

    await worker.save();

    res.json({
      success: true,
      message: 'Worker rejected successfully',
      data: worker
    });
  } catch (error) {
    console.error('Reject worker error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject worker',
      error: error.message 
    });
  }
};

// Suspend/Activate User
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.isActive = !user.isActive;
    
    if (!user.isActive && user.role === 'worker') {
      await Worker.findOneAndUpdate(
        { userId: user._id },
        { isActive: false, suspensionReason: reason }
      );
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status',
      error: error.message 
    });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user has active bookings
    const activeBookings = await Booking.countDocuments({ 
      $or: [{ userId: userId }, { workerId: userId }],
      status: { $in: ['pending', 'in-progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete user with active bookings' 
      });
    }

    // Delete worker profile if exists
    if (user.role === 'worker') {
      await Worker.findOneAndDelete({ userId: user._id });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete user',
      error: error.message 
    });
  }
};

// Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'all',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (status !== 'all') {
      query.status = status;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('workerId', 'name email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bookings',
      error: error.message 
    });
  }
};

// Update Booking Status (Admin Override)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, adminNotes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    booking.status = status;
    booking.adminNotes = adminNotes;
    booking.updatedBy = req.user.id;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking status',
      error: error.message 
    });
  }
};

// Get All Reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      minRating = 0,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (minRating > 0) {
      query.rating = { $gte: parseInt(minRating) };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('workerId', 'name email')
      .populate('bookingId', 'serviceType')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    review.deletedBy = req.user.id;
    review.deletionReason = reason;
    review.deletedAt = new Date();

    await Review.findByIdAndDelete(reviewId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete review',
      error: error.message 
    });
  }
};

// Get System Statistics
exports.getSystemStats = async (req, res) => {
  try {
    // Category-wise worker distribution
    const categoryDistribution = await Worker.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Booking status distribution
    const bookingDistribution = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average rating by category
    const avgRatingByCategory = await Review.aggregate([
      {
        $lookup: {
          from: 'workers',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: '$worker' },
      { $unwind: '$worker.categories' },
      {
        $group: {
          _id: '$worker.categories',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      },
      { $sort: { averageRating: -1 } }
    ]);

    // Top rated workers
    const topWorkers = await Review.aggregate([
      {
        $group: {
          _id: '$workerId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      },
      { $match: { totalReviews: { $gte: 5 } } },
      { $sort: { averageRating: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]);

    res.json({
      success: true,
      data: {
        categoryDistribution,
        bookingDistribution,
        avgRatingByCategory,
        topWorkers
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch system statistics',
      error: error.message 
    });
  }
};

// Get Revenue Analytics
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy;
    let dateFilter = {};

    switch (period) {
      case 'daily':
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        dateFilter = { createdAt: { $gte: last30Days } };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'yearly':
        groupBy = { year: { $year: '$createdAt' } };
        break;
      default: // monthly
        const last12Months = new Date();
        last12Months.setMonth(last12Months.getMonth() - 12);
        dateFilter = { createdAt: { $gte: last12Months } };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Category-wise revenue
    const categoryRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$serviceType',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        revenueData,
        categoryRevenue
      }
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch revenue analytics',
      error: error.message 
    });
  }
};
