const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');
const { errorResponse, successResponse, getPaginationMeta } = require('../utils/helpers');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get booking statistics
    const [
      totalBookings,
      activeBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings
    ] = await Promise.all([
      Booking.countDocuments({ userId }),
      Booking.countDocuments({ userId, status: { $in: ['pending', 'confirmed', 'in-progress'] } }),
      Booking.countDocuments({ userId, status: 'completed' }),
      Booking.countDocuments({ userId, status: 'pending' }),
      Booking.countDocuments({ userId, status: 'cancelled' })
    ]);

    // Calculate total spent
    const completedBookingsData = await Booking.find({ 
      userId, 
      status: 'completed'
    }).select('totalPrice');
    
    const totalSpent = completedBookingsData.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Get favorite workers (workers with multiple bookings)
    const favoriteWorkers = await Booking.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$workerId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'workerusers',
          localField: '_id',
          foreignField: '_id',
          as: 'worker'
        }
      },
      { $unwind: { path: '$worker', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          workerId: '$_id',
          bookingCount: '$count',
          name: '$worker.name',
          profileImage: '$worker.profileImage',
          categories: '$worker.categories',
          rating: '$worker.rating'
        }
      }
    ]);

    // Get user's average rating given
    const userReviews = await Review.find({ userId }).select('rating');
    const averageRatingGiven = userReviews.length > 0
      ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length
      : 0;

    const stats = {
      bookings: {
        total: totalBookings,
        active: activeBookings,
        completed: completedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings
      },
      spending: {
        total: totalSpent,
        average: completedBookings > 0 ? Math.round(totalSpent / completedBookings) : 0
      },
      favorites: favoriteWorkers,
      averageRatingGiven: parseFloat(averageRatingGiven.toFixed(1))
    };

    successResponse(res, stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = '-createdAt' } = req.query;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate({
        path: 'workerId',
        populate: {
          path: 'userId',
          select: 'name phone email profileImage'
        }
      })
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const meta = getPaginationMeta(total, page, limit);

    res.status(200).json({
      success: true,
      count: bookings.length,
      meta,
      data: bookings
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get recent bookings
// @route   GET /api/users/bookings/recent
// @access  Private
exports.getRecentBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'workerId',
        populate: {
          path: 'userId',
          select: 'name phone profileImage'
        }
      })
      .sort('-createdAt')
      .limit(limit);

    successResponse(res, bookings, 'Recent bookings retrieved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    // This is a placeholder - you'll need to implement a Notification model
    // For now, we'll return booking-related notifications
    const query = { userId: req.user._id };
    
    if (unreadOnly === 'true') {
      query.notificationRead = false;
    }

    const bookings = await Booking.find(query)
      .select('serviceType status createdAt updatedAt')
      .populate('workerId', 'userId')
      .populate({
        path: 'workerId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort('-updatedAt')
      .limit(parseInt(limit));

    // Transform bookings into notifications
    const notifications = bookings.map(booking => ({
      _id: booking._id,
      type: 'booking_update',
      title: getNotificationTitle(booking.status),
      message: `Your ${booking.serviceType} booking has been ${booking.status}`,
      booking: booking._id,
      workerName: booking.workerId?.userId?.name || 'Worker',
      read: booking.notificationRead || false,
      createdAt: booking.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// Helper function for notification titles
function getNotificationTitle(status) {
  const titles = {
    'pending': 'Booking Pending',
    'confirmed': 'Booking Confirmed',
    'in-progress': 'Service Started',
    'completed': 'Service Completed',
    'cancelled': 'Booking Cancelled'
  };
  return titles[status] || 'Booking Update';
}

// @desc    Get user reviews (reviews user has given)
// @route   GET /api/users/reviews
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Review.countDocuments({ userId: req.user._id });
    const reviews = await Review.find({ userId: req.user._id })
      .populate({
        path: 'workerId',
        populate: {
          path: 'userId',
          select: 'name profileImage'
        }
      })
      .populate('bookingId', 'serviceType totalPrice')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const meta = getPaginationMeta(total, page, limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      meta,
      data: reviews
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Search for workers
// @route   GET /api/users/search-workers
// @access  Private
exports.searchWorkers = async (req, res) => {
  try {
    const { query, category, minRating, maxPrice, longitude, latitude, maxDistance = 10000 } = req.query;

    const Worker = require('../models/Worker.model');
    
    let searchQuery = {
      isActive: true,
      verified: true,
      availability: 'available'
    };

    // Text search
    if (query) {
      searchQuery.$or = [
        { skills: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      searchQuery.categories = category;
    }

    // Rating filter
    if (minRating) {
      searchQuery.rating = { $gte: parseFloat(minRating) };
    }

    // Price filter
    if (maxPrice) {
      searchQuery.pricePerHour = { $lte: parseFloat(maxPrice) };
    }

    // Location filter
    if (longitude && latitude) {
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      };
    }

    const workers = await Worker.find(searchQuery)
      .populate('userId', 'name profileImage phone')
      .limit(20);

    successResponse(res, workers, 'Workers found successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update user live location
// @route   PUT /api/users/location
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const { coordinates, address, city, state, pincode, accuracy } = req.body;

    // Validate coordinates
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid coordinates [longitude, latitude]'
      });
    }

    const [longitude, latitude] = coordinates;

    // Validate longitude and latitude ranges
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update current location
    user.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      address: address || user.location.address,
      city: city || user.location.city,
      state: state || user.location.state,
      pincode: pincode || user.location.pincode,
      capturedAt: new Date(),
      accuracy: accuracy || null
    };

    // Add to location history (keep last 50 locations)
    if (!user.locationHistory) {
      user.locationHistory = [];
    }

    user.locationHistory.unshift({
      coordinates: [longitude, latitude],
      address: address,
      capturedAt: new Date(),
      accuracy: accuracy
    });

    // Keep only last 50 location entries
    if (user.locationHistory.length > 50) {
      user.locationHistory = user.locationHistory.slice(0, 50);
    }

    await user.save();

    successResponse(res, {
      location: user.location,
      locationHistory: user.locationHistory
    }, 'Location updated successfully');
  } catch (error) {
    console.error('Update location error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get user location history
// @route   GET /api/users/location/history
// @access  Private
exports.getLocationHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const user = await User.findById(req.user._id).select('locationHistory location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const history = user.locationHistory ? user.locationHistory.slice(0, parseInt(limit)) : [];

    successResponse(res, {
      currentLocation: user.location,
      history: history,
      total: user.locationHistory ? user.locationHistory.length : 0
    }, 'Location history retrieved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// Note: All functions are already exported using exports.functionName pattern above
// No need for module.exports object

