const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const WorkerUser = require('../models/WorkerUser.model');
const Admin = require('../models/Admin.model');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // DEBUG: Log all headers
  console.log('🔐 [AUTH MIDDLEWARE] Request to:', req.method, req.path);
  console.log('📋 [AUTH MIDDLEWARE] Authorization header:', req.headers.authorization || 'MISSING');

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ [AUTH MIDDLEWARE] Token extracted:', token.substring(0, 30) + '...');
  }

  // Check if token exists
  if (!token) {
    console.error('❌ [AUTH MIDDLEWARE] NO TOKEN - Sending 401');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    console.log('🔍 [AUTH MIDDLEWARE] Verifying JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [AUTH MIDDLEWARE] JWT valid. User ID:', decoded.id);

    // Try to get user from User collection first
    let user = await User.findById(decoded.id).select('-password');
    console.log('🔍 [AUTH MIDDLEWARE] User lookup result:', user ? `Found: ${user.email} (${user.role})` : 'Not in User collection');

    // If not found in User collection, try WorkerUser collection
    if (!user) {
      console.log('🔍 [AUTH MIDDLEWARE] Trying WorkerUser collection...');
      user = await WorkerUser.findById(decoded.id).select('-password');
      console.log('🔍 [AUTH MIDDLEWARE] WorkerUser lookup result:', user ? `Found: ${user.email} (${user.role})` : 'Not found');
    }

    // If not found in WorkerUser collection, try Admin collection
    if (!user) {
      console.log('🔍 [AUTH MIDDLEWARE] Trying Admin collection...');
      user = await Admin.findById(decoded.id).select('-password');
      console.log('🔍 [AUTH MIDDLEWARE] Admin lookup result:', user ? `Found: ${user.email}` : 'Not found');
    }

    if (!user) {
      console.error('❌ [AUTH MIDDLEWARE] User not found in any collection (User, WorkerUser, Admin)');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      console.error('❌ [AUTH MIDDLEWARE] User account deactivated:', user.email);
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    console.log('✅ [AUTH MIDDLEWARE] Auth successful! User:', user.email, 'Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH MIDDLEWARE] JWT Verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: error.message
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is worker
exports.isWorker = async (req, res, next) => {
  const Worker = require('../models/Worker.model');
  
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    
    if (!worker) {
      return res.status(403).json({
        success: false,
        message: 'You need to be registered as a worker to access this route'
      });
    }

    req.worker = worker;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying worker status',
      error: error.message
    });
  }
};
