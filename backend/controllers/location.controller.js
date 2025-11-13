/**
 * WORKER LOCATION CONTROLLER
 * Handles location updates and storage for workers
 */

const Worker = require('../models/Worker.model');
const WorkerUser = require('../models/WorkerUser.model');
const User = require('../models/User.model');
const { formatLocationForDatabase } = require('../utils/address.utils');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Update worker location with detected address
// @route   PUT /api/worker/location
// @access  Private
exports.updateWorkerLocation = async (req, res) => {
  try {
    const { latitude, longitude, detectedAddress, accuracy } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!latitude || !longitude || !detectedAddress) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and detected address are required'
      });
    }

    console.log('📍 Updating worker location:');
    console.log('  Coordinates: [', longitude, ',', latitude, ']');
    console.log('  Detected Address:', detectedAddress);

    // Format location data with address parsing
    const locationData = formatLocationForDatabase({
      latitude,
      longitude,
      detectedAddress,
      accuracy
    });

    // Find and update worker
    const worker = await Worker.findOne({ userId });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found'
      });
    }

    // Update worker location
    worker.location = locationData;
    await worker.save();

    console.log('✅ Worker location updated successfully');
    console.log('📝 Parsed Address:', worker.location.parsedAddress);
    console.log('🔑 Keywords:', worker.location.keywords);

    successResponse(res, 200, {
      worker,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating worker location:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Update user location with detected address
// @route   PUT /api/user/location
// @access  Private
exports.updateUserLocation = async (req, res) => {
  try {
    const { latitude, longitude, detectedAddress, accuracy } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!latitude || !longitude || !detectedAddress) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and detected address are required'
      });
    }

    console.log('📍 Updating user location:');
    console.log('  Coordinates: [', longitude, ',', latitude, ']');
    console.log('  Detected Address:', detectedAddress);

    // Format location data with address parsing
    const locationData = formatLocationForDatabase({
      latitude,
      longitude,
      detectedAddress,
      accuracy
    });

    // Find and update user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user location
    user.location = locationData;
    
    // Add to location history
    if (!user.locationHistory) {
      user.locationHistory = [];
    }
    user.locationHistory.push({
      coordinates: locationData.coordinates,
      address: locationData.address,
      capturedAt: locationData.capturedAt,
      accuracy: locationData.accuracy
    });

    await user.save();

    console.log('✅ User location updated successfully');
    console.log('📝 Parsed Address:', user.location.parsedAddress);
    console.log('🔑 Keywords:', user.location.keywords);

    successResponse(res, 200, {
      user,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating user location:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get user location history
// @route   GET /api/user/location-history
// @access  Private
exports.getUserLocationHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('locationHistory location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    successResponse(res, 200, {
      currentLocation: user.location,
      history: user.locationHistory || [],
      totalLocations: (user.locationHistory || []).length
    });
  } catch (error) {
    console.error('❌ Error fetching user location history:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Search workers by location keyword
// @route   GET /api/search/workers-by-location-keyword
// @access  Public
exports.searchWorkersByLocationKeyword = async (req, res) => {
  try {
    const { keyword, latitude, longitude, maxDistance = 15, limit = 20, skip = 0 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Location keyword is required'
      });
    }

    console.log(`🔍 Searching workers by location keyword: "${keyword}"`);

    // Build query
    const query = {
      approvalStatus: 'approved',
      isActive: true
    };

    // Add text search for keywords
    query.$text = { $search: keyword };

    // If coordinates provided, add geospatial filter
    if (latitude && longitude) {
      const bbox = calculateBoundingBox(parseFloat(latitude), parseFloat(longitude), parseFloat(maxDistance));
      query.location = {
        $geoWithin: {
          $box: [
            [bbox.minLon, bbox.minLat],
            [bbox.maxLon, bbox.maxLat]
          ]
        }
      };
      console.log(`📍 Filtering by distance: ${maxDistance}km`);
    }

    const workers = await Worker.find(query)
      .populate('userId', 'name email phone profileImage')
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    console.log(`✅ Found ${workers.length} workers`);

    successResponse(res, 200, {
      workers,
      count: workers.length,
      keyword,
      totalResults: await Worker.countDocuments(query)
    });
  } catch (error) {
    console.error('❌ Error searching by location keyword:', error);
    errorResponse(res, error, 500);
  }
};

// Helper function to calculate bounding box
const calculateBoundingBox = (lat, lon, radiusKm) => {
  const latChange = radiusKm / 111;
  const lonChange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  return {
    minLat: lat - latChange,
    maxLat: lat + latChange,
    minLon: lon - lonChange,
    maxLon: lon + lonChange
  };
};
