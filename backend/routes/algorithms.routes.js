const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Import algorithms
const { findOptimalWorkers } = require('../algorithms/workerRecommendationEngine');
const { analyzeBookingPatterns, predictDemand } = require('../algorithms/bookingPatternAnalysis');

/**
 * ALGORITHM 1: Worker Recommendation
 * POST /api/algorithms/recommend-workers
 * 
 * Find optimal workers based on skill match, rating, price, location
 * using the Intelligent Worker Recommendation Engine
 */
router.post('/recommend-workers', protect, async (req, res) => {
  try {
    const {
      userLat,
      userLng,
      skills = [],
      category,
      maxPrice,
      radius = 10,
      limit = 10
    } = req.body;

    // Validate required parameters
    if (!userLat || !userLng) {
      return res.status(400).json({
        success: false,
        message: 'User latitude and longitude are required'
      });
    }

    // Call recommendation algorithm
    const result = await findOptimalWorkers({
      userLat,
      userLng,
      skills,
      category,
      maxPrice,
      radius,
      limit
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: 'Worker recommendations generated successfully',
      data: result.data,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error in recommend-workers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
});

/**
 * ALGORITHM 2: Booking Pattern Analysis
 * POST /api/algorithms/analyze-patterns
 * 
 * Analyze temporal booking patterns to identify trends,
 * peak times, worker performance clusters, and generate insights
 */
router.post('/analyze-patterns', protect, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      workerId,
      category,
      limit = 100
    } = req.body;

    // Call pattern analysis algorithm
    const result = await analyzeBookingPatterns({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      workerId,
      category,
      limit
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: 'Booking patterns analyzed successfully',
      data: result.data,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error in analyze-patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze patterns',
      error: error.message
    });
  }
});

/**
 * Demand Forecasting (extension of Algorithm 2)
 * POST /api/algorithms/forecast-demand
 * 
 * Predict booking demand for upcoming days based on historical patterns
 */
router.post('/forecast-demand', protect, async (req, res) => {
  try {
    const {
      forecastDays = 7,
      lookbackDays = 30,
      aggregateBy = 'day'
    } = req.body;

    // Call demand prediction
    const result = await predictDemand({
      forecastDays,
      lookbackDays,
      aggregateBy
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      message: 'Demand forecast generated successfully',
      data: result.data,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Error in forecast-demand:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to forecast demand',
      error: error.message
    });
  }
});

/**
 * Algorithm Performance Metrics
 * GET /api/algorithms/metrics
 * 
 * Get execution time and performance metrics for algorithms
 */
router.get('/metrics', protect, async (req, res) => {
  try {
    // This would fetch from a metrics collection
    // For now, return placeholder metrics
    res.json({
      success: true,
      data: {
        algorithms: [
          {
            name: 'Intelligent Worker Recommendation Engine',
            avgExecutionTimeMs: '45-120',
            complexity: 'O(n log n)',
            spaceComplexity: 'O(k)',
            status: 'active'
          },
          {
            name: 'Temporal Booking Pattern Analysis',
            avgExecutionTimeMs: '150-400',
            complexity: 'O(n + m log m)',
            spaceComplexity: 'O(m)',
            status: 'active'
          }
        ]
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Algorithm Documentation
 * GET /api/algorithms/docs
 * 
 * Get detailed documentation about both algorithms
 */
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    algorithms: [
      {
        id: 1,
        name: 'Intelligent Worker Recommendation Engine',
        type: 'Search & Ranking Algorithm',
        novelty: 'Novel multi-factor ranking using geospatial queries, skill matching, and performance normalization',
        description: 'Finds optimal workers by combining geographic proximity, skill matching, rating normalization, availability check, and price optimization',
        inputs: {
          userLat: 'User latitude',
          userLng: 'User longitude',
          skills: 'Array of required skills',
          category: 'Service category',
          maxPrice: 'Maximum price per hour',
          radius: 'Search radius in km',
          limit: 'Max results (default: 10)'
        },
        outputs: {
          rankedWorkers: 'Array of workers sorted by composite score',
          scores: 'Breakdown of scores for each factor'
        },
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(k)',
        url: '/api/algorithms/recommend-workers'
      },
      {
        id: 2,
        name: 'Temporal Booking Pattern Analysis Engine',
        type: 'Time-Series Analysis & Clustering',
        novelty: 'Novel temporal clustering and statistical analysis of booking patterns with trend prediction',
        description: 'Analyzes booking patterns across multiple time dimensions (hourly, daily, monthly) and generates predictive insights',
        inputs: {
          startDate: 'Analysis period start',
          endDate: 'Analysis period end',
          workerId: 'Optional worker filter',
          category: 'Optional category filter',
          limit: 'Max workers to cluster'
        },
        outputs: {
          temporalPatterns: 'Patterns by hour, day, month',
          statisticalMetrics: 'Aggregated statistics',
          workerPerformance: 'Clustered worker analysis',
          predictiveInsights: 'Generated insights'
        },
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(m)',
        url: '/api/algorithms/analyze-patterns'
      }
    ]
  });
});

module.exports = router;
