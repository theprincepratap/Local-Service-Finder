const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  role: {
    type: String,
    default: 'worker',
    immutable: true
  },
  profileImage: {
    type: String,
    default: 'default-avatar.jpg'
  },
  
  // Worker-specific fields
  skills: [{
    type: String,
    required: true
  }],
  categories: [{
    type: String,
    enum: [
      'Plumber',
      'Electrician',
      'Carpenter',
      'Painter',
      'Cleaner',
      'AC Repair',
      'Appliance Repair',
      'Pest Control',
      'Gardener',
      'Driver',
      'Moving & Packing',
      'Beauty & Salon',
      'Tutor',
      'Other'
    ],
    required: true
  }],
  experience: {
    type: Number, // in years
    required: true,
    min: 0
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please provide price per hour'],
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
      // Index defined at schema level below
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    pincode: {
      type: String
    }
  },
  serviceRadius: {
    type: Number, // in kilometers
    default: 10
  },
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  verified: {
    type: Boolean,
    default: false
  },
  documents: {
    idProof: {
      type: String // Cloudinary URL
    },
    addressProof: {
      type: String
    },
    certificate: {
      type: String
    }
  },
  bio: {
    type: String,
    maxlength: 500
  },
  totalJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  wallet: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative']
  },
  walletHistory: [{
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    description: String,
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    balanceAfter: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  pendingEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String
  },
  workingHours: {
    monday: { start: String, end: String, isAvailable: Boolean },
    tuesday: { start: String, end: String, isAvailable: Boolean },
    wednesday: { start: String, end: String, isAvailable: Boolean },
    thursday: { start: String, end: String, isAvailable: Boolean },
    friday: { start: String, end: String, isAvailable: Boolean },
    saturday: { start: String, end: String, isAvailable: Boolean },
    sunday: { start: String, end: String, isAvailable: Boolean }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalMessage: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },
  suspensionReason: {
    type: String
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
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

// Encrypt password before saving
workerUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
workerUserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create indexes for queries
workerUserSchema.index({ location: '2dsphere' }); // GeoJSON index for location-based queries
workerUserSchema.index({ rating: -1 });
workerUserSchema.index({ pricePerHour: 1 });
workerUserSchema.index({ categories: 1 });
workerUserSchema.index({ approvalStatus: 1 });

module.exports = mongoose.model('WorkerUser', workerUserSchema);
