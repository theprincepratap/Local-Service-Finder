const User = require('../models/User.model');
const WorkerUser = require('../models/WorkerUser.model');
const Worker = require('../models/Worker.model');
const { sendTokenResponse } = require('../utils/auth.utils');
const { errorResponse } = require('../utils/helpers');
const { formatLocationForDatabase } = require('../utils/address.utils');
const path = require('path');
const fs = require('fs');
const transporter = require('../config/email');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');
const { uploadProfileImage: uploadToCloudinary } = require('../utils/cloudinary.helper');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, location, workerData } = req.body;

    // Validate role
    const userRole = role || 'user';
    if (!['user', 'worker'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either user or worker'
      });
    }

    // Check if user/worker exists in respective collection
    if (userRole === 'user') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }
    } else {
      const existingWorker = await WorkerUser.findOne({ email });
      if (existingWorker) {
        return res.status(400).json({
          success: false,
          message: 'Worker already exists with this email'
        });
      }
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

    // Prepare location data
    let locationData = {
      type: 'Point',
      coordinates: [0, 0], // Default coordinates
      city: location?.city,
      state: location?.state,
      pincode: location?.pincode,
      address: location?.address
    };

    if (location && location.coordinates && location.coordinates.length === 2) {
      locationData.coordinates = location.coordinates;
    }

    // NEW: Use utility to format location with detected address
    if (location && location.detectedAddress) {
      console.log('📍 Processing detected address:', location.detectedAddress);
      locationData = formatLocationForDatabase(location);
    }

    let newUser;

    // Create user in respective collection
    if (userRole === 'user') {
      // Create regular user in User collection
      const userData = {
        name,
        email,
        password,
        phone,
        role: 'user',
        location: locationData
      };

      newUser = await User.create(userData);
      console.log('✅ Regular user created in User collection:', newUser._id);
    } else {
      // Create worker in WorkerUser collection
      const workerUserData = {
        name,
        email,
        password,
        phone,
        role: 'worker',
        location: locationData,
        skills: workerData.skills,
        categories: workerData.categories,
        experience: workerData.experience,
        pricePerHour: workerData.pricePerHour,
        serviceRadius: workerData.serviceRadius || 10,
        bio: workerData.bio || '',
        availability: 'available',
        verified: false,
        approvalStatus: 'pending',
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

      newUser = await WorkerUser.create(workerUserData);
      console.log('✅ Worker created in WorkerUser collection:', newUser._id);
    }

    console.log(`✅ ${userRole === 'worker' ? 'Worker' : 'User'} registered successfully:`, newUser._id);
    sendTokenResponse(newUser, 201, res, `${userRole === 'worker' ? 'Worker' : 'User'} registered successfully`);
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

    // Check in User collection first
    let user = await User.findOne({ email }).select('+password');
    
    // If not found in User, check in WorkerUser collection
    if (!user) {
      user = await WorkerUser.findOne({ email }).select('+password');
    }

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

    // Get user to check for old image
    const user = await User.findById(req.user._id);
    
    // Delete old profile photo from Cloudinary if exists
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
    console.log('✅ Image uploaded to Cloudinary:', imageUrl);

    // Update user with new profile image URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ Profile photo uploaded successfully');

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        user: updatedUser,
        imageUrl: imageUrl
      }
    });
  } catch (error) {
    console.error('❌ Upload photo error:', error);
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

// @desc    Forgot password - Generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user in either collection
    let user = await User.findOne({ email });
    if (!user) {
      user = await WorkerUser.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address'
      });
    }

    // Generate reset token (random string)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenHash = require('crypto').createHash('sha256').update(resetToken).digest('hex');

    // Set reset token and expiry (valid for 1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset link - frontend URL
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    console.log('🔗 Password reset link:', resetLink);

    // Send email
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@localworkerfinder.com',
        to: email,
        subject: 'Password Reset Request - Local Worker Finder',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center; }
                .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
                .button { display: inline-block; padding: 12px 30px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; font-size: 12px; color: #666; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px; }
                .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Password Reset Request</h2>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>We received a request to reset your password. Click the button below to create a new password.</p>
                  
                  <center>
                    <a href="${resetLink}" class="button">Reset Your Password</a>
                  </center>
                  
                  <p>Or copy and paste this link in your browser:</p>
                  <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;">
                    ${resetLink}
                  </p>
                  
                  <div class="warning">
                    <strong>Important:</strong> This link will expire in <strong>1 hour</strong>.
                  </div>
                  
                  <p>If you did not request a password reset, please ignore this email. Your account remains secure.</p>
                  
                  <p>Best regards,<br><strong>Local Worker Finder Team</strong></p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Local Worker Finder. All rights reserved.</p>
                  <p>This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: 'Password Reset Request\n\nClick the link to reset your password:\n' + resetLink + '\n\nThis link expires in 1 hour.\n\nIf you did not request this, ignore this email.'
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent to:', email);
    } catch (emailError) {
      console.error('⚠️ Email sending error (but reset link generated):', emailError.message);
      // Don't fail the request if email fails - user can still get reset link from console/dev mode
    }
    
    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
      // In development, return the link for testing
      ...(process.env.NODE_ENV === 'development' && { resetLink })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide password and confirm password'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    let user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      user = await WorkerUser.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✅ Password reset successfully for user:', user._id);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    errorResponse(res, error, 500);
  }
};
