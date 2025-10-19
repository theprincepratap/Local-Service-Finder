const Booking = require('../models/Booking.model');
const Worker = require('../models/Worker.model');
const Payment = require('../models/Payment.model');
const { errorResponse, successResponse, getPaginationMeta } = require('../utils/helpers');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      workerId,
      serviceType,
      description,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      location,
      totalPrice
    } = req.body;

    // Check if worker exists and is available
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    if (worker.availability !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Worker is not available at the moment'
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      workerId,
      serviceType,
      description,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      location,
      totalPrice
    });

    // Update worker total jobs
    worker.totalJobs += 1;
    await worker.save();

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name phone email')
      .populate('workerId');

    // Send real-time notification to worker
    const io = req.app.get('io');
    io.to(worker.userId.toString()).emit('newBooking', populatedBooking);

    successResponse(res, populatedBooking, 'Booking created successfully', 201);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('workerId')
      .populate({
        path: 'workerId',
        populate: {
          path: 'userId',
          select: 'name phone email profileImage'
        }
      })
      .sort('-createdAt')
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

// @desc    Get worker bookings
// @route   GET /api/bookings/worker-bookings
// @access  Private (Worker)
exports.getWorkerBookings = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;

    let query = { workerId: worker._id };
    if (status) {
      query.status = status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name phone email profileImage location')
      .sort('-createdAt')
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

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name phone email profileImage')
      .populate({
        path: 'workerId',
        populate: {
          path: 'userId',
          select: 'name phone email profileImage'
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const worker = await Worker.findById(booking.workerId);
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      worker.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    successResponse(res, booking, 'Booking fetched successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update booking status (Worker)
// @route   PUT /api/bookings/:id/status
// @access  Private (Worker)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the worker owns this booking
    const worker = await Worker.findOne({ userId: req.user._id });
    if (booking.workerId.toString() !== worker._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = status;
    
    if (status === 'rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason;
    }

    if (status === 'in-progress') {
      booking.startTime = new Date();
      worker.availability = 'busy';
      await worker.save();
    }

    if (status === 'completed') {
      booking.endTime = new Date();
      const duration = (booking.endTime - booking.startTime) / (1000 * 60 * 60); // hours
      booking.actualDuration = duration;
      
      worker.completedJobs += 1;
      worker.totalEarnings += booking.workerEarning;
      worker.availability = 'available';
      await worker.save();
    }

    await booking.save();

    // Send real-time update to user
    const io = req.app.get('io');
    io.to(booking.userId.toString()).emit('bookingStatusChanged', {
      bookingId: booking._id,
      status: booking.status
    });

    successResponse(res, booking, 'Booking status updated successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Cancel booking (User)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save();

    // Process refund if payment was made
    if (booking.paymentStatus === 'paid') {
      // Implement refund logic here
      booking.paymentStatus = 'refunded';
      await booking.save();
    }

    // Send notification to worker
    const io = req.app.get('io');
    const worker = await Worker.findById(booking.workerId);
    io.to(worker.userId.toString()).emit('bookingCancelled', {
      bookingId: booking._id
    });

    successResponse(res, booking, 'Booking cancelled successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};
