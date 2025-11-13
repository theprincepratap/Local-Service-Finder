/**
 * WORKER SEARCH CONTROLLER - Location-Based Matching
 * 
 * Handles searching for workers near user's location
 * with advanced filtering and ranking
 */

const WorkerUser = require('../models/WorkerUser.model');
const { successResponse, errorResponse } = require('../utils/helpers');
const {
  calculateHaversineDistance,
  sortWorkersByDistance,
  filterWorkers,
  calculateMatchScore,
  calculateBoundingBox
} = require('../utils/geospatial.utils');

// @desc    Search workers near user location
// @route   GET /api/search/nearby-workers
// @access  Private
exports.searchNearbyWorkers = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      keyword,              // NEW: Location keyword search (e.g., "Delhi", "Dwarka")
      maxDistance = 15,     // Default: 15 km
      maxPrice,
      minRating = 0,
      categories,
      minExperience = 0,
      availability = 'all',
      sortBy = 'distance',  // distance, rating, price, relevance
      limit = 20,
      skip = 0
    } = req.query;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    console.log(`🔍 Searching workers near [${lat}, ${lon}] within ${maxDistance}km`);
    if (keyword) {
      console.log(`🏷️ Keyword: "${keyword}"`);
    }
    
    // Log total workers in database for debugging
    const totalWorkers = await WorkerUser.countDocuments({ approvalStatus: 'approved', isActive: true });
    console.log(`📊 Total approved workers in database: ${totalWorkers}`);

    // Step 1: Build base query
    const query = {
      approvalStatus: 'approved',
      isActive: true
    };

    // Step 2: Add location-based search (using $near for better results)
    // Use $geoNear for distance-sorted results
    const geoNearQuery = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        distanceField: 'distance',
        maxDistance: maxDistance * 1000, // Convert km to meters
        spherical: true,
        query: query // Apply filters to geo search
      }
    };

    // Add keyword filter with flexible matching
    if (keyword && keyword.trim()) {
      const keywordLower = keyword.toLowerCase().trim();
      
      // Use $or for flexible matching across multiple fields
      query.$or = [
        { name: { $regex: keywordLower, $options: 'i' } },
        { skills: { $regex: keywordLower, $options: 'i' } },
        { categories: { $regex: keywordLower, $options: 'i' } },
        { 'location.city': { $regex: keywordLower, $options: 'i' } },
        { 'location.state': { $regex: keywordLower, $options: 'i' } },
        { 'location.address': { $regex: keywordLower, $options: 'i' } },
        { bio: { $regex: keywordLower, $options: 'i' } }
      ];
      console.log(`📝 Keyword search enabled for: "${keyword}"`);
    }

    // Add price filter to query
    if (maxPrice) {
      query.pricePerHour = { $lte: parseFloat(maxPrice) };
    }

    // Add rating filter to query
    if (minRating > 0) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Add experience filter to query
    if (minExperience > 0) {
      query.experience = { $gte: parseInt(minExperience) };
    }

    // Add category filter to query
    if (categories) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : categories.split(',');
      query.categories = { $in: categoryArray };
    }

    // Add availability filter to query
    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    console.log('📊 MongoDB Query:', JSON.stringify(query, null, 2));

    // Step 3: Execute MongoDB aggregation with $geoNear for location-based search
    let workers = await WorkerUser.aggregate([
      geoNearQuery,
      {
        $project: {
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpire: 0,
          'bankDetails.accountNumber': 0,
          'bankDetails.ifscCode': 0
        }
      }
    ]);

    console.log(`✅ Found ${workers.length} workers within ${maxDistance}km`);

    // Step 4: If no workers found with location filter, try without location
    if (workers.length === 0) {
      console.log('⚠️ No workers found with location filter, trying broader search...');
      
      const broadQuery = { ...query };
      delete broadQuery.$or; // Remove location-based filters if any
      
      workers = await WorkerUser.find(broadQuery)
        .select('-password -resetPasswordToken -resetPasswordExpire -bankDetails')
        .limit(parseInt(limit) * 2) // Get more results for fallback
        .lean();
      
      // Calculate distances manually
      workers = workers.map(worker => ({
        ...worker,
        distance: parseFloat(calculateHaversineDistance(
          lat,
          lon,
          worker.location.coordinates[1],
          worker.location.coordinates[0]
        ).toFixed(2))
      }));
      
      // Sort by distance
      workers = workers.sort((a, b) => a.distance - b.distance);
      
      console.log(`📍 Fallback search found ${workers.length} workers`);
    } else {
      // Convert distance from meters to kilometers
      workers = workers.map(worker => ({
        ...worker,
        distance: parseFloat((worker.distance / 1000).toFixed(2))
      }));
    }

    // Step 5: Calculate match scores
    workers = workers.map(worker => ({
      ...worker,
      matchScore: calculateMatchScore(worker, {
        maxDistance,
        avgPrice: maxPrice || 500
      })
    }));

    // Step 6: Sort results (distance is already sorted by $geoNear)
    let sortedWorkers = workers;
    if (sortBy === 'rating') {
      sortedWorkers = workers.sort((a, b) => b.rating - a.rating || b.totalReviews - a.totalReviews);
    } else if (sortBy === 'price') {
      sortedWorkers = workers.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'matchScore') {
      sortedWorkers = workers.sort((a, b) => b.matchScore - a.matchScore);
    }
    // else sortBy === 'distance' (already sorted by $geoNear)

    // Step 8: Pagination
    const total = sortedWorkers.length;
    const paginatedWorkers = sortedWorkers.slice(
      parseInt(skip),
      parseInt(skip) + parseInt(limit)
    );

    // Step 9: Format response
    const response = {
      success: true,
      data: {
        workers: paginatedWorkers,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          pages: Math.ceil(total / parseInt(limit))
        },
        searchCriteria: {
          userLocation: { latitude: lat, longitude: lon },
          maxDistance: `${maxDistance} km`,
          maxPrice,
          minRating,
          sortBy
        }
      },
      message: `Found ${total} workers near your location`
    };

    console.log(`📤 Returning ${paginatedWorkers.length} workers to user`);
    successResponse(res, response.data, response.message);
  } catch (error) {
    console.error('Search error:', error);
    errorResponse(res, error, 500);
  }
};

// @desc    Get worker details with distance
// @route   GET /api/search/worker/:id
// @access  Private
exports.getWorkerWithDistance = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Use WorkerUser model
    const worker = await WorkerUser.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -bankDetails');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    let workerData = worker.toObject();

    // Calculate distance if coordinates provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      workerData.distance = calculateHaversineDistance(
        lat,
        lon,
        worker.location.coordinates[1],
        worker.location.coordinates[0]
      );

      workerData.matchScore = calculateMatchScore(workerData, {
        maxDistance: 50
      });
    }

    successResponse(res, workerData, 'Worker details retrieved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get worker statistics including distance from user
// @route   GET /api/search/worker-stats/:id
// @access  Private
exports.getWorkerStats = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const { id } = req.params;

    // Use WorkerUser model
    const worker = await WorkerUser.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpire -bankDetails');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Calculate distance
    let distance = null;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      distance = calculateHaversineDistance(
        lat,
        lon,
        worker.location.coordinates[1],
        worker.location.coordinates[0]
      );
    }

    const stats = {
      workerId: worker._id,
      name: worker.name,
      profileImage: worker.profileImage,
      categories: worker.categories,
      skills: worker.skills,
      experience: worker.experience,
      pricePerHour: worker.pricePerHour,
      rating: worker.rating,
      totalReviews: worker.totalReviews,
      totalJobs: worker.totalJobs,
      completedJobs: worker.completedJobs,
      distance: distance,
      serviceRadius: worker.serviceRadius,
      availability: worker.availability,
      approvalStatus: worker.approvalStatus,
      location: {
        city: worker.location.city,
        state: worker.location.state,
        pincode: worker.location.pincode,
        address: worker.location.address
      }
    };

    successResponse(res, stats, 'Worker statistics retrieved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

// @desc    Get popular categories and their average data
// @route   GET /api/search/categories/stats
// @access  Public
exports.getCategoriesStats = async (req, res) => {
  try {
    const categories = [
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
    ];

    const stats = await Promise.all(
      categories.map(async (category) => {
        // Use WorkerUser model
        const workers = await WorkerUser.find({
          categories: category,
          approvalStatus: 'approved',
          isActive: true
        });

        const avgRating =
          workers.length > 0
            ? workers.reduce((sum, w) => sum + w.rating, 0) / workers.length
            : 0;

        const avgPrice =
          workers.length > 0
            ? workers.reduce((sum, w) => sum + w.pricePerHour, 0) / workers.length
            : 0;

        return {
          category,
          workerCount: workers.length,
          avgRating: avgRating.toFixed(2),
          avgPrice: Math.round(avgPrice),
          availability: workers.filter(w => w.availability === 'available').length
        };
      })
    );

    successResponse(res, stats, 'Category statistics retrieved successfully');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

module.exports = exports;
