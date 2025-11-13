const Review = require('../models/Review.model');
const Booking = require('../models/Booking.model');
const Worker = require('../models/Worker.model');
const { errorResponse, successResponse, getPaginationMeta } = require('../utils/helpers');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { bookingId, workerId, rating, comment, categories, images } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await Review.create({
      bookingId,
      userId: req.user._id,
      workerId,
      rating,
      comment,
      categories,
      images
    });

    // Populate review
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name profileImage')
      .populate('workerId')
      .populate('bookingId', 'serviceType totalPrice');

    successResponse(res, populatedReview, 'Review created successfully', 201);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { page = 1, limit = 10, sortBy = '-createdAt', minRating } = req.query;

    let query = { workerId };
    if (minRating) {
      query.rating = { $gte: parseInt(minRating) };
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('userId', 'name profileImage')
      .populate('bookingId', 'serviceType totalPrice scheduledDate')
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const meta = getPaginationMeta(total, page, limit);

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { workerId: mongoose.Types.ObjectId(workerId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      meta,
      distribution,
      data: reviews
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get user's reviews (reviews given by user)
// @route   GET /api/reviews/user
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
      .populate('bookingId', 'serviceType totalPrice scheduledDate')
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

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, categories, images } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review belongs to user
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (categories) review.categories = categories;
    if (images) review.images = images;

    await review.save();

    // Populate review
    review = await Review.findById(review._id)
      .populate('userId', 'name profileImage')
      .populate('workerId')
      .populate('bookingId', 'serviceType totalPrice');

    successResponse(res, review, 'Review updated successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if review belongs to user
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Worker response to a review
// @route   PUT /api/reviews/:id/response
// @access  Private (Worker)
exports.respondToReview = async (req, res) => {
  try {
    const { comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if the review is for the worker
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker || review.workerId.toString() !== worker._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews for your profile'
      });
    }

    // Add response
    review.response = {
      comment,
      respondedAt: new Date()
    };

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name profileImage')
      .populate('workerId')
      .populate('bookingId', 'serviceType totalPrice');

    successResponse(res, populatedReview, 'Response added successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.helpful += 1;
    await review.save();

    successResponse(res, review, 'Review marked as helpful');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get review statistics for a worker
// @route   GET /api/reviews/worker/:workerId/stats
// @access  Public
exports.getReviewStats = async (req, res) => {
  try {
    const { workerId } = req.params;

    const stats = await Review.aggregate([
      { $match: { workerId: mongoose.Types.ObjectId(workerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          averagePunctuality: { $avg: '$categories.punctuality' },
          averageQuality: { $avg: '$categories.quality' },
          averageBehavior: { $avg: '$categories.behavior' },
          averageValue: { $avg: '$categories.value' }
        }
      }
    ]);

    // Get rating distribution
    const distribution = await Review.aggregate([
      { $match: { workerId: mongoose.Types.ObjectId(workerId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const result = stats.length > 0 ? {
      averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
      categories: {
        punctuality: parseFloat((stats[0].averagePunctuality || 0).toFixed(1)),
        quality: parseFloat((stats[0].averageQuality || 0).toFixed(1)),
        behavior: parseFloat((stats[0].averageBehavior || 0).toFixed(1)),
        value: parseFloat((stats[0].averageValue || 0).toFixed(1))
      },
      distribution: distribution.reduce((acc, item) => {
        acc[`star${item._id}`] = item.count;
        return acc;
      }, {})
    } : {
      averageRating: 0,
      totalReviews: 0,
      categories: {
        punctuality: 0,
        quality: 0,
        behavior: 0,
        value: 0
      },
      distribution: {}
    };

    successResponse(res, result, 'Review statistics retrieved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// Note: All functions are already exported using exports.functionName pattern above
// No need for module.exports object
