const User = require('../models/User.model');
const Worker = require('../models/Worker.model');
const { sendTokenResponse } = require('../utils/auth.utils');
const { errorResponse } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, location, workerData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate role
    const userRole = role || 'user';
    if (!['user', 'worker'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either user or worker'
      });
    }

    // If registering as worker, validate required worker fields
    if (userRole === 'worker') {
      if (!workerData) {
        return res.status(400).json({
          success: false,
          message: 'Worker details are required for worker registration'
        });
      }

      const { skills, categories, experience, pricePerHour, serviceRadius, bio } = workerData;
      
      // Validate required worker fields
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one skill'
        });
      }

      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please select at least one service category'
        });
      }

      if (experience === undefined || experience < 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide valid work experience'
        });
      }

      if (!pricePerHour || pricePerHour <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid price per hour'
        });
      }

      if (!location || !location.city || !location.state || !location.pincode) {
        return res.status(400).json({
          success: false,
          message: 'Please provide complete location details (city, state, pincode)'
        });
      }
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      phone,
      role: userRole
    };

    // Add location if provided, otherwise use default
    if (location && location.coordinates && location.coordinates.length === 2) {
      userData.location = {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
        city: location.city,
        state: location.state,
        pincode: location.pincode
      };
    } else {
      // Set default location (users can update later)
      userData.location = {
        type: 'Point',
        coordinates: [0, 0], // Default coordinates
        city: location?.city,
        state: location?.state,
        pincode: location?.pincode,
        address: location?.address
      };
    }

    // Create user
    const user = await User.create(userData);

    // If worker, create worker profile
    if (userRole === 'worker') {
      try {
        const workerProfileData = {
          userId: user._id,
          skills: workerData.skills,
          categories: workerData.categories,
          experience: workerData.experience,
          pricePerHour: workerData.pricePerHour,
          serviceRadius: workerData.serviceRadius || 10,
          bio: workerData.bio || '',
          location: userData.location,
          availability: 'available',
          verified: false,
          workingHours: {
            monday: { start: '09:00', end: '18:00', isAvailable: true },
            tuesday: { start: '09:00', end: '18:00', isAvailable: true },
            wednesday: { start: '09:00', end: '18:00', isAvailable: true },
            thursday: { start: '09:00', end: '18:00', isAvailable: true },
            friday: { start: '09:00', end: '18:00', isAvailable: true },
            saturday: { start: '09:00', end: '18:00', isAvailable: true },
            sunday: { start: '09:00', end: '18:00', isAvailable: false }
          }
        };

        const workerProfile = await Worker.create(workerProfileData);
        console.log('✅ Worker profile created successfully:', workerProfile._id);
      } catch (workerError) {
        console.error('❌ Error creating worker profile:', workerError);
        // Delete the user if worker profile creation fails
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          success: false,
          message: 'Failed to create worker profile. Please try again.',
          error: workerError.message
        });
      }
    }

    console.log(`✅ ${userRole === 'worker' ? 'Worker' : 'User'} registered successfully:`, user._id);
    sendTokenResponse(user, 201, res, `${userRole === 'worker' ? 'Worker' : 'User'} registered successfully`);
  } catch (error) {
    console.error('Registration error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // If user is a worker, get worker details
    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await Worker.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        workerProfile
      }
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      data: user
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-photo
// @access  Private
exports.uploadPhoto = async (req, res) => {
  try {
    console.log('📸 Upload photo request received');
    console.log('User:', req.user?._id);
    console.log('File:', req.file);

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Delete old profile photo if exists
    const user = await User.findById(req.user._id);
    if (user.profileImage && user.profileImage !== 'default-avatar.jpg') {
      const oldImagePath = path.join(__dirname, '../uploads/profiles', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('🗑️ Deleted old profile image');
      }
    }

    // Update user with new profile image
    const filename = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: filename },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ Profile photo uploaded successfully:', filename);

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        user: updatedUser,
        imageUrl: `/uploads/profiles/${filename}`
      }
    });
  } catch (error) {
    console.error('❌ Upload photo error:', error);
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    errorResponse(res, error, 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
