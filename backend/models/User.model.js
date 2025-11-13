const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    enum: ['user', 'worker'],
    default: 'user'
  },
  profileImage: {
    type: String,
    default: 'default-avatar.jpg'
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
    address: {
      type: String
    },
    // NEW: Store detected address from geolocation API
    detectedAddress: {
      type: String  // Full detected address text
    },
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
    // NEW: Location keywords for text search
    keywords: {
      street: String,
      area: String,
      city: String,
      district: String,
      state: String,
      pincode: String,
      country: String,
      fullAddress: String  // Combined for full-text search
    },
    capturedAt: {
      type: Date // When location was captured
    },
    accuracy: {
      type: Number // Location accuracy in meters
    }
  },
  locationHistory: [{
    coordinates: {
      type: [Number] // [longitude, latitude]
    },
    address: String,
    capturedAt: {
      type: Date,
      default: Date.now
    },
    accuracy: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  wallet: {
    type: Number,
    default: 50000,
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
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create GeoJSON index for location-based queries
userSchema.index({ location: '2dsphere' });

// Create text indexes for location keyword search
userSchema.index({ 'location.keywords.street': 'text' });
userSchema.index({ 'location.keywords.area': 'text' });
userSchema.index({ 'location.keywords.city': 'text' });
userSchema.index({ 'location.keywords.district': 'text' });
userSchema.index({ 'location.keywords.state': 'text' });
userSchema.index({ 'location.keywords.pincode': 'text' });
userSchema.index({ 'location.keywords.fullAddress': 'text' });

module.exports = mongoose.model('User', userSchema);
