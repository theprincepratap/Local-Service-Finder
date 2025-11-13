const mongoose = require('mongoose');
const Booking = require('../models/Booking.model');
const WorkerUser = require('../models/WorkerUser.model');
const User = require('../models/User.model');
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
    const worker = await WorkerUser.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    if (worker.approvalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Worker is not approved yet'
      });
    }

    if (worker.availability !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Worker is not available at the moment'
      });
    }

    // Check user wallet balance
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.wallet < totalPrice) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. Your balance: ₹${user.wallet}, Required: ₹${totalPrice}`
      });
    }

    // Deduct amount from wallet
    user.wallet -= totalPrice;
    
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

    // Add transaction to wallet history with bookingId
    user.walletHistory.push({
      amount: totalPrice,
      type: 'debit',
      description: `Payment for ${serviceType} booking`,
      bookingId: booking._id,
      balanceAfter: user.wallet,
      createdAt: new Date()
    });
    await user.save();

    // Update worker total jobs
    worker.totalJobs += 1;
    await worker.save();

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name phone email')
      .populate('workerId', 'name phone email profileImage skills categories pricePerHour rating');

    // Send real-time notification to worker (if socket.io is available)
    const io = req.app.get('io');
    if (io) {
      io.to(worker._id.toString()).emit('newBooking', populatedBooking);
    }

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
      .populate('workerId', 'name phone email profileImage skills categories pricePerHour rating location')
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
    // req.user is already the WorkerUser from auth middleware
    const worker = req.user;
    
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
      .populate('workerId', 'name phone email profileImage skills categories pricePerHour rating location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      booking.workerId._id.toString() !== req.user._id.toString() &&
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
  // Start a MongoDB session for ACID transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, rejectionReason } = req.body;

    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the worker owns this booking
    const worker = req.user; // WorkerUser from auth middleware
    if (booking.workerId.toString() !== worker._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    const oldStatus = booking.status;

    // ACID PROPERTY: Handle money flow based on status change
    
    // 1. WORKER ACCEPTS BOOKING (confirmed)
    if (status === 'confirmed' && oldStatus === 'pending') {
      // Money is held by the user (already deducted during booking creation)
      // Credit to worker's pending earnings (not yet in wallet)
      await WorkerUser.findByIdAndUpdate(
        worker._id,
        {
          $inc: { pendingEarnings: booking.totalPrice }
        },
        { session }
      );

      booking.status = 'confirmed';
      
      console.log(`✅ Booking ${booking._id} accepted: ₹${booking.totalPrice} moved to worker's pending earnings`);
    }
    
    // 2. WORKER DECLINES/REJECTS BOOKING
    else if (status === 'rejected' && oldStatus === 'pending') {
      // REFUND MONEY TO USER
      const user = await User.findById(booking.userId).session(session);
      
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'User not found for refund'
        });
      }

      // Credit back to user's wallet
      user.wallet += booking.totalPrice;
      user.walletHistory.push({
        amount: booking.totalPrice,
        type: 'credit',
        description: `Refund for rejected ${booking.serviceType} booking`,
        bookingId: booking._id,
        balanceAfter: user.wallet,
        createdAt: new Date()
      });
      
      await user.save({ session });
      
      booking.status = 'rejected';
      if (rejectionReason) {
        booking.rejectionReason = rejectionReason;
      }

      console.log(`💰 Booking ${booking._id} rejected: ₹${booking.totalPrice} refunded to user wallet`);
    }
    
    // 3. WORKER STARTS TRAVELING (on-the-way)
    else if (status === 'on-the-way' && oldStatus === 'confirmed') {
      booking.status = 'on-the-way';
      
      // Mark worker as busy
      await WorkerUser.findByIdAndUpdate(
        worker._id,
        { availability: 'busy' },
        { session }
      );

      console.log(`🚗 Booking ${booking._id}: Worker is on the way`);
    }
    
    // 4. WORKER ARRIVES AND STARTS JOB (in-progress)
    else if (status === 'in-progress' && (oldStatus === 'confirmed' || oldStatus === 'on-the-way')) {
      booking.status = 'in-progress';
      booking.startTime = new Date();
      
      await WorkerUser.findByIdAndUpdate(
        worker._id,
        { availability: 'busy' },
        { session }
      );

      console.log(`🚀 Booking ${booking._id} started by worker`);
    }
    
    // 5. WORKER COMPLETES JOB (completed)
    else if (status === 'completed' && oldStatus === 'in-progress') {
      booking.status = 'completed';
      booking.endTime = new Date();
      
      if (booking.startTime) {
        const duration = (booking.endTime - booking.startTime) / (1000 * 60 * 60); // hours
        booking.actualDuration = duration;
      }

      // TRANSFER MONEY FROM PENDING TO WALLET
      const workerDoc = await WorkerUser.findById(worker._id).session(session);
      
      workerDoc.wallet += booking.totalPrice;
      workerDoc.pendingEarnings -= booking.totalPrice;
      workerDoc.totalEarnings += booking.totalPrice;
      workerDoc.completedJobs += 1;
      workerDoc.availability = 'available';
      
      workerDoc.walletHistory.push({
        amount: booking.totalPrice,
        type: 'credit',
        description: `Payment for completed ${booking.serviceType} service`,
        bookingId: booking._id,
        balanceAfter: workerDoc.wallet,
        createdAt: new Date()
      });

      await workerDoc.save({ session });

      console.log(`✅ Booking ${booking._id} completed: ₹${booking.totalPrice} credited to worker wallet`);
    }
    
    // Invalid status transition
    else {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${oldStatus} to ${status}`
      });
    }

    await booking.save({ session });

    // Commit transaction - ACID complete
    await session.commitTransaction();

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name phone email wallet')
      .populate('workerId', 'name phone email wallet pendingEarnings');

    // Send real-time update to user
    const io = req.app.get('io');
    if (io) {
      io.to(booking.userId.toString()).emit('bookingStatusChanged', {
        bookingId: booking._id,
        status: booking.status,
        message: status === 'rejected' ? 'Your booking was declined. Money has been refunded to your wallet.' : `Booking status updated to ${status}`
      });
    }

    successResponse(res, populatedBooking, 'Booking status updated successfully');
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    console.error('❌ Booking status update failed:', error);
    errorResponse(res, error, 500);
  } finally {
    session.endSession();
  }
};

// @desc    Cancel booking (User)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  // Start ACID transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`
      });
    }

    const oldStatus = booking.status;

    // REFUND LOGIC based on booking status
    if (oldStatus === 'pending') {
      // Booking not yet accepted - full refund to user
      const user = await User.findById(booking.userId).session(session);
      user.wallet += booking.totalPrice;
      user.walletHistory.push({
        amount: booking.totalPrice,
        type: 'credit',
        description: `Refund for cancelled ${booking.serviceType} booking`,
        bookingId: booking._id,
        balanceAfter: user.wallet,
        createdAt: new Date()
      });
      await user.save({ session });

      console.log(`💰 Booking ${booking._id} cancelled (pending): ₹${booking.totalPrice} refunded to user`);
    } 
    else if (oldStatus === 'confirmed') {
      // Booking accepted but not started - refund user and deduct from worker's pending
      const user = await User.findById(booking.userId).session(session);
      const worker = await WorkerUser.findById(booking.workerId).session(session);

      // Refund to user
      user.wallet += booking.totalPrice;
      user.walletHistory.push({
        amount: booking.totalPrice,
        type: 'credit',
        description: `Refund for cancelled ${booking.serviceType} booking`,
        bookingId: booking._id,
        balanceAfter: user.wallet,
        createdAt: new Date()
      });
      await user.save({ session });

      // Deduct from worker's pending earnings
      worker.pendingEarnings -= booking.totalPrice;
      await worker.save({ session });

      console.log(`💰 Booking ${booking._id} cancelled (confirmed): ₹${booking.totalPrice} refunded to user, deducted from worker's pending`);
    }
    else if (oldStatus === 'in-progress') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that is already in progress. Please contact support.'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    await booking.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Send notification to worker (if socket.io is available)
    const io = req.app.get('io');
    if (io) {
      io.to(booking.workerId.toString()).emit('bookingCancelled', {
        bookingId: booking._id,
        status: 'cancelled'
      });
    }

    successResponse(res, booking, 'Booking cancelled and refund processed successfully');
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Booking cancellation failed:', error);
    errorResponse(res, error, 500);
  } finally {
    session.endSession();
  }
};

// @desc    Update worker's real-time location during booking
// @route   PUT /api/bookings/:id/worker-location
// @access  Private (Worker)
exports.updateWorkerLocationForBooking = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const bookingId = req.params.id;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if worker owns this booking
    if (booking.workerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Only allow location updates for on-the-way or in-progress bookings
    if (!['on-the-way', 'in-progress'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Location tracking only available for active bookings'
      });
    }

    // Update worker's current location
    await WorkerUser.findByIdAndUpdate(req.user._id, {
      'location.coordinates': [longitude, latitude],
      'location.lastUpdated': new Date()
    });

    // Emit real-time location update to user via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(booking.userId.toString()).emit('workerLocationUpdate', {
        bookingId: booking._id,
        workerLocation: {
          latitude,
          longitude,
          timestamp: new Date()
        }
      });
    }

    successResponse(res, {
      latitude,
      longitude,
      bookingId,
      status: booking.status
    }, 'Location updated successfully');
  } catch (error) {
    console.error('❌ Worker location update failed:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get worker's current location for a booking (User can track)
// @route   GET /api/bookings/:id/worker-location
// @access  Private (User)
exports.getWorkerLocationForBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('workerId', 'name phone location profileImage');

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
        message: 'Not authorized'
      });
    }

    // Only allow location tracking for on-the-way or in-progress bookings
    if (!['on-the-way', 'in-progress'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Worker location tracking only available for active bookings'
      });
    }

    const workerLocation = booking.workerId.location;

    successResponse(res, {
      bookingId: booking._id,
      bookingStatus: booking.status,
      worker: {
        name: booking.workerId.name,
        phone: booking.workerId.phone,
        profileImage: booking.workerId.profileImage,
        location: workerLocation
      },
      userLocation: booking.location
    }, 'Worker location fetched successfully');
  } catch (error) {
    console.error('❌ Failed to get worker location:', error);
    errorResponse(res, error, 500);
  }
};

