const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify admin role
exports.verifyAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.',
      error: error.message 
    });
  }
};
