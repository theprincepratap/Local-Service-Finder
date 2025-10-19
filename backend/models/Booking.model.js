const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 1
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'rejected',
      'on-the-way',
      'in-progress',
      'completed',
      'cancelled'
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  workerEarning: {
    type: Number,
    default: 0
  },
  startTime: Date,
  endTime: Date,
  actualDuration: Number,
  cancellationReason: String,
  rejectionReason: String,
  images: [String], // Before/after images
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ workerId: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate platform fee and worker earning
bookingSchema.pre('save', function(next) {
  if (this.isModified('totalPrice')) {
    this.platformFee = this.totalPrice * 0.1; // 10% platform fee
    this.workerEarning = this.totalPrice - this.platformFee;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
