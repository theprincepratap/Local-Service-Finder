const Admin = require('../models/Admin.model');
const { sendTokenResponse } = require('../utils/auth.utils');
const { errorResponse } = require('../utils/helpers');
const crypto = require('crypto');

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check in Admin collection
    let admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if admin account is locked
    if (admin.isLocked()) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive'
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Add activity log
    await admin.addActivityLog(
      'LOGIN',
      'Admin logged in successfully',
      req.ip,
      req.headers['user-agent']
    );

    sendTokenResponse(admin, 200, res, 'Admin login successful');
  } catch (error) {
    console.error('Admin login error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get current logged in admin
// @route   GET /api/auth/admin/me
// @access  Private (Admin)
exports.getAdminMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update admin details
// @route   PUT /api/auth/admin/updatedetails
// @access  Private (Admin)
exports.updateAdminDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage
    };

    // Don't allow changing role through this endpoint
    const admin = await Admin.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    await admin.addActivityLog(
      'UPDATE_PROFILE',
      'Admin updated their profile details',
      req.ip,
      req.headers['user-agent']
    );

    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: admin
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Update admin password
// @route   PUT /api/auth/admin/updatepassword
// @access  Private (Admin)
exports.updateAdminPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('+password');

    // Check current password
    if (!(await admin.matchPassword(req.body.currentPassword))) {
      await admin.addActivityLog(
        'FAILED_PASSWORD_UPDATE',
        'Failed attempt to update password with incorrect current password',
        req.ip,
        req.headers['user-agent']
      );

      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    admin.password = req.body.newPassword;
    await admin.save();

    await admin.addActivityLog(
      'PASSWORD_CHANGED',
      'Admin changed their password',
      req.ip,
      req.headers['user-agent']
    );

    sendTokenResponse(admin, 200, res, 'Admin password updated successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Forgot admin password
// @route   POST /api/auth/admin/forgotpassword
// @access  Public
exports.adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: 'If that email is associated with an admin account, password reset instructions will be sent'
      });
    }

    // Generate reset token
    const resetToken = admin.getResetPasswordToken();
    await admin.save({ validateBeforeSave: false });

    // For development, return the token directly
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({
        success: true,
        message: 'Reset token generated',
        data: {
          email: admin.email,
          resetToken: resetToken,
          resetUrl: `http://localhost:5173/admin/reset-password/${resetToken}`
        }
      });
    }

    // For production, send email
    // TODO: Implement email sending
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error) {
    console.error('Admin forgot password error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Reset admin password
// @route   POST /api/auth/admin/resetpassword/:resettoken
// @access  Public
exports.adminResetPassword = async (req, res) => {
  try {
    const { resettoken } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Set new password
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save();

    await admin.addActivityLog(
      'PASSWORD_RESET',
      'Admin reset their password using reset token',
      req.ip,
      req.headers['user-agent']
    );

    sendTokenResponse(admin, 200, res, 'Password reset successfully');
  } catch (error) {
    console.error('Admin reset password error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get admin activity log
// @route   GET /api/auth/admin/activity-log
// @access  Private (Admin)
exports.getAdminActivityLog = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        activityLog: admin.activityLog,
        totalActivities: admin.activityLog.length
      }
    });
  } catch (error) {
    errorResponse(res, error, 500);
  }
};
