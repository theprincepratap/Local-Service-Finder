const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
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
      default: [0, 0], // Default to [longitude, latitude]
      index: '2dsphere'
    },
    address: String,
    // NEW: Store detected address from geolocation API
    detectedAddress: String,  // Full detected address text
    
    // NEW: Parsed address components for easier querying
    parsedAddress: {
      street: String,      // "Vandalur - Mambakkam - Kelambakkam Road"
      area: String,        // "Kolapakkam"
      city: String,        // "Tirupporur"
      district: String,    // "Chengalpattu"
      state: String,       // "Tamil Nadu"
      pincode: String,     // "600127"
      country: String      // "India"
    },
    
    // Location keywords for text-based matching
    keywords: {
      street: String,
      area: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      country: String,
      fullAddress: String     // "Full detected address for search"
    },
    
    capturedAt: Date,        // When location was captured
    accuracy: Number         // Location accuracy in meters
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
  suspensionReason: {
    type: String
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

// Create GeoJSON index for location-based queries
workerSchema.index({ location: '2dsphere' });
workerSchema.index({ rating: -1 });
workerSchema.index({ pricePerHour: 1 });
workerSchema.index({ categories: 1 });

// Create text indexes for location keyword search
workerSchema.index({ 'location.keywords.street': 'text' });
workerSchema.index({ 'location.keywords.area': 'text' });
workerSchema.index({ 'location.keywords.city': 'text' });
workerSchema.index({ 'location.keywords.district': 'text' });
workerSchema.index({ 'location.keywords.state': 'text' });
workerSchema.index({ 'location.keywords.pincode': 'text' });
workerSchema.index({ 'location.keywords.fullAddress': 'text' });
workerSchema.index({ 'location.keywords.city': 'text', 'location.keywords.area': 'text' });
workerSchema.index({ skills: 'text', 'location.keywords.city': 'text' });

module.exports = mongoose.model('Worker', workerSchema);
