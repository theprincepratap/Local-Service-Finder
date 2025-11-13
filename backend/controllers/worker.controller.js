const WorkerUser = require('../models/WorkerUser.model');
const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const { errorResponse, successResponse, getPaginationMeta, paginate } = require('../utils/helpers');
const { sortByDistance, smartSort } = require('../utils/location.utils');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
const { uploadProfileImage: uploadToCloudinary, uploadDocumentImage } = require('../utils/cloudinary.helper');

// @desc    Register as worker
// @route   POST /api/workers/register
// @access  Private
exports.registerWorker = async (req, res) => {
  try {
    const {
      skills,
      categories,
      experience,
      pricePerHour,
      location,
      bio,
      serviceRadius
    } = req.body;

    // Check if user is already a worker
    const existingWorker = await Worker.findOne({ userId: req.user._id });
    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a worker'
      });
    }

    // Create worker profile
    const worker = await Worker.create({
      userId: req.user._id,
      skills,
      categories,
      experience,
      pricePerHour,
      location,
      bio,
      serviceRadius
    });

    // Update user role to worker
    await User.findByIdAndUpdate(req.user._id, { role: 'worker' });

    successResponse(res, worker, 'Worker profile created successfully', 201);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get nearby workers
// @route   GET /api/workers/nearby
// @access  Public
exports.getNearbyWorkers = async (req, res) => {
  try {
    const {
      longitude,
      latitude,
      maxDistance = 10000, // 10km default
      category,
      minRating,
      maxPrice,
      sortBy = 'smart',
      page = 1,
      limit = 10
    } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude'
      });
    }

    // Build query
    let query = {
      availability: 'available',
      verified: true,
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance) // in meters
        }
      }
    };

    // Add filters
    if (category) {
      query.categories = category;
    }
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    if (maxPrice) {
      query.pricePerHour = { $lte: parseFloat(maxPrice) };
    }

    // Execute query
    let workers = await Worker.find(query)
      .populate('userId', 'name email phone profileImage')
      .lean();

    // Sort workers
    const userLocation = [parseFloat(longitude), parseFloat(latitude)];
    
    switch (sortBy) {
      case 'distance':
        workers = sortByDistance(workers, userLocation);
        break;
      case 'rating':
        workers = workers.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        workers = workers.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'price-high':
        workers = workers.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case 'smart':
      default:
        workers = smartSort(workers, userLocation);
        break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedWorkers = workers.slice(startIndex, endIndex);

    const meta = getPaginationMeta(workers.length, page, limit);

    res.status(200).json({
      success: true,
      count: paginatedWorkers.length,
      meta,
      data: paginatedWorkers
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Public
exports.getWorkerById = async (req, res) => {
  try {
    console.log('🔍 Fetching worker by ID:', req.params.id);
    
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid ObjectId format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID format'
      });
    }
    
    const worker = await WorkerUser.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -bankDetails.accountNumber -bankDetails.ifscCode');

    if (!worker) {
      console.log('❌ Worker not found (ID:', req.params.id + ')');
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    console.log('✅ Worker found:', worker.name, '| Role:', worker.role, '| Status:', worker.approvalStatus);

    // Get recent reviews
    try {
      const Review = require('../models/Review.model');
      const reviews = await Review.find({ workerId: worker._id })
        .populate('userId', 'name profileImage')
        .sort('-createdAt')
        .limit(5);
      
      successResponse(res, { worker, reviews }, 'Worker fetched successfully');
    } catch (reviewError) {
      console.log('⚠️ Could not fetch reviews:', reviewError.message);
      // Return worker without reviews if review fetch fails
      successResponse(res, { worker, reviews: [] }, 'Worker fetched successfully');
    }
  } catch (error) {
    console.error('❌ Error fetching worker:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private (Worker)
exports.updateWorkerProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      skills: req.body.skills,
      categories: req.body.categories,
      experience: req.body.experience,
      pricePerHour: req.body.pricePerHour,
      location: req.body.location,
      bio: req.body.bio,
      serviceRadius: req.body.serviceRadius,
      workingHours: req.body.workingHours,
      bankDetails: req.body.bankDetails
    };

    const worker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    successResponse(res, worker, 'Profile updated successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update worker availability
// @route   PUT /api/workers/availability
// @access  Private (Worker)
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const worker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      { availability },
      { new: true }
    );

    successResponse(res, worker, 'Availability updated successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get worker dashboard stats
// @route   GET /api/workers/dashboard/stats
// @access  Private (Worker)
exports.getDashboardStats = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    // Get booking statistics
    const [
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookingsCount,
      cancelledBookings,
      todayBookings
    ] = await Promise.all([
      Booking.countDocuments({ workerId: worker._id }),
      Booking.countDocuments({ workerId: worker._id, status: 'pending' }),
      Booking.countDocuments({ workerId: worker._id, status: { $in: ['confirmed', 'in-progress'] } }),
      Booking.countDocuments({ workerId: worker._id, status: 'completed' }),
      Booking.countDocuments({ workerId: worker._id, status: 'cancelled' }),
      Booking.countDocuments({
        workerId: worker._id,
        scheduledDate: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      })
    ]);

    // Get recent bookings
    const recentBookings = await Booking.find({ workerId: worker._id })
      .populate('userId', 'name phone profileImage email')
      .sort('-createdAt')
      .limit(10);

    // Get earnings for current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const completedThisMonth = await Booking.find({
      workerId: worker._id,
      status: 'completed',
      updatedAt: { $gte: startOfMonth }
    }).select('totalPrice');

    const monthlyEarnings = completedThisMonth.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Get reviews
    const Review = require('../models/Review.model');
    const recentReviews = await Review.find({ workerId: worker._id })
      .populate('userId', 'name profileImage')
      .populate('bookingId', 'serviceType')
      .sort('-createdAt')
      .limit(5);

    // Calculate response rate
    const respondedBookings = await Booking.countDocuments({
      workerId: worker._id,
      status: { $ne: 'pending' }
    });
    const responseRate = totalBookings > 0 ? Math.round((respondedBookings / totalBookings) * 100) : 0;

    // Calculate completion rate
    const completionRate = totalBookings > 0 
      ? Math.round((completedBookingsCount / totalBookings) * 100) 
      : 0;

    const stats = {
      overview: {
        totalJobs: worker.totalJobs || totalBookings,
        completedJobs: worker.completedJobs || completedBookingsCount,
        activeJobs: activeBookings,
        pendingJobs: pendingBookings,
        todayJobs: todayBookings,
        totalEarnings: worker.totalEarnings || 0,
        monthlyEarnings,
        rating: worker.rating || 0,
        totalReviews: worker.totalReviews || 0,
        responseRate,
        completionRate
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        active: activeBookings,
        completed: completedBookingsCount,
        cancelled: cancelledBookings,
        today: todayBookings
      },
      earnings: {
        total: worker.totalEarnings || 0,
        thisMonth: monthlyEarnings,
        average: completedBookingsCount > 0 
          ? Math.round(worker.totalEarnings / completedBookingsCount) 
          : 0
      },
      profile: {
        availability: worker.availability,
        verified: worker.verified,
        isActive: worker.isActive,
        categories: worker.categories,
        skills: worker.skills,
        experience: worker.experience,
        pricePerHour: worker.pricePerHour,
        serviceRadius: worker.serviceRadius
      },
      recentBookings,
      recentReviews
    };

    successResponse(res, stats, 'Dashboard stats fetched successfully');
  } catch (error) {
    console.error('Worker dashboard stats error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get worker profile (for editing)
// @route   GET /api/workers/profile
// @access  Private (Worker)
exports.getWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id }).populate('userId', 'name email phone profileImage');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    successResponse(res, worker, 'Worker profile fetched successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Upload profile image
// @route   POST /api/workers/profile/image
// @access  Private (Worker)
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const User = require('../models/User.model');
    
    // Get user to check for old image
    const user = await User.findById(req.user._id);
    
    // Delete old profile image from Cloudinary if exists
    if (user.profileImage && user.profileImage.includes('cloudinary.com')) {
      const oldPublicId = getPublicIdFromUrl(user.profileImage);
      if (oldPublicId) {
        try {
          await deleteImage(oldPublicId);
          console.log('🗑️ Deleted old profile image from Cloudinary');
        } catch (error) {
          console.log('⚠️ Could not delete old image:', error.message);
        }
      }
    }

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer);
    console.log('✅ Profile image uploaded to Cloudinary:', imageUrl);

    // Update user's profile image with Cloudinary URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    successResponse(res, { profileImage: imageUrl }, 'Profile image uploaded successfully');
  } catch (error) {
    console.error('❌ Profile image upload error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Upload worker document
// @route   POST /api/workers/profile/document
// @access  Private (Worker)
exports.uploadWorkerDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a document'
      });
    }

    const { docType } = req.body;
    
    if (!['idProof', 'addressProof', 'certificate'].includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Get worker to check for old document
    const worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    // Delete old document from Cloudinary if exists
    if (worker.documents && worker.documents[docType] && worker.documents[docType].includes('cloudinary.com')) {
      const oldPublicId = getPublicIdFromUrl(worker.documents[docType]);
      if (oldPublicId) {
        try {
          await deleteImage(oldPublicId);
          console.log(`🗑️ Deleted old ${docType} from Cloudinary`);
        } catch (error) {
          console.log('⚠️ Could not delete old document:', error.message);
        }
      }
    }

    // Upload document to Cloudinary
    const documentUrl = await uploadDocumentImage(req.file.buffer, docType);
    console.log(`✅ ${docType} uploaded to Cloudinary:`, documentUrl);

    // Update worker document with Cloudinary URL
    const updatedWorker = await Worker.findOneAndUpdate(
      { userId: req.user._id },
      { [`documents.${docType}`]: documentUrl },
      { new: true }
    );

    successResponse(res, { documentUrl }, `${docType} uploaded successfully`);
  } catch (error) {
    console.error('❌ Document upload error:', error);
    errorResponse(res, error, 500);
  }
};
