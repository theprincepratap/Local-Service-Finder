/**
 * AI-POWERED SEARCH ROUTES
 * Conversational and contextual search endpoints
 */

const express = require('express');
const router = express.Router();
const {
  aiPoweredSearch,
  getAISuggestions,
  getTrendingQueries
} = require('../controllers/aiSearch.controller');

/**
 * @route   GET /api/ai-search/search
 * @desc    AI-powered conversational search for workers
 * @access  Public
 * @query   {string} query - Natural language search query (required)
 * @query   {number} latitude - User's latitude (required)
 * @query   {number} longitude - User's longitude (required)
 * @query   {number} maxDistance - Max search radius in km (optional, default: 15)
 * @query   {number} limit - Number of results (optional, default: 10)
 * 
 * @example
 * GET /api/ai-search/search?query=I+need+a+plumber+in+delhi&latitude=28.7041&longitude=77.1025&limit=10
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     query: {
 *       services: ['plumber'],
 *       maxPrice: null,
 *       minExperience: 0,
 *       urgency: 'normal',
 *       confidence: 85
 *     },
 *     explanation: "Looking for plumber",
 *     results: [...],
 *     totalFound: 15,
 *     searchMode: 'strict',
 *     confidence: 85
 *   }
 * }
 */
router.get('/search', aiPoweredSearch);

/**
 * @route   GET /api/ai-search/suggestions
 * @desc    Get search suggestions based on partial input
 * @access  Public
 * @query   {string} partial - Partial search term (min 2 chars)
 * 
 * @example
 * GET /api/ai-search/suggestions?partial=plumb
 * 
 * Response:
 * {
 *   success: true,
 *   suggestions: [
 *     "Find me a plumber",
 *     "I need a plumber",
 *     "plumb near me",
 *     "Experienced plumb",
 *     "Affordable plumb"
 *   ]
 * }
 */
router.get('/suggestions', getAISuggestions);

/**
 * @route   GET /api/ai-search/trending
 * @desc    Get trending search queries
 * @access  Public
 * 
 * @example
 * GET /api/ai-search/trending
 * 
 * Response:
 * {
 *   success: true,
 *   trending: [
 *     "Find a plumber near me",
 *     "I need an electrician",
 *     ...
 *   ]
 * }
 */
router.get('/trending', getTrendingQueries);

module.exports = router;
