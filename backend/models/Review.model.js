const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // One review per booking
  },
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
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  categories: {
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    behavior: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  images: [String], // Review images
  helpful: {
    type: Number,
    default: 0
  },
  response: {
    comment: String,
    respondedAt: Date
  },
  isVerified: {
    type: Boolean,
    default: true
  },
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

// Indexes
reviewSchema.index({ workerId: 1, rating: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });

// Static method to calculate average rating for a worker
reviewSchema.statics.calculateAverageRating = async function(workerId) {
  const stats = await this.aggregate([
    {
      $match: { workerId: mongoose.Types.ObjectId(workerId) }
    },
    {
      $group: {
        _id: '$workerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Worker').findByIdAndUpdate(workerId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await mongoose.model('Worker').findByIdAndUpdate(workerId, {
      rating: 0,
      totalReviews: 0
    });
  }
};

// Update worker rating after review is saved
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.workerId);
});

// Update worker rating after review is deleted
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.workerId);
});

module.exports = mongoose.model('Review', reviewSchema);
