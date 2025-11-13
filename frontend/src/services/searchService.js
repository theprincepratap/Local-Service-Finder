/**
 * SEARCH SERVICE - Frontend API Integration
 * Handles all search-related API calls
 */

import api from './api';

export const searchService = {
  /**
   * Search for nearby workers
   * 
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {object} filters - Search filters
   * @returns {Promise} - Search results
   */
  searchNearbyWorkers: async (latitude, longitude, filters = {}) => {
    try {
      const params = {
        latitude,
        longitude,
        keyword: filters.keyword,           // NEW: Location keyword search
        maxDistance: filters.maxDistance || 15,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating || 0,
        categories: filters.categories ? filters.categories.join(',') : undefined,
        minExperience: filters.minExperience || 0,
        availability: filters.availability || 'all',
        sortBy: filters.sortBy || 'distance',
        limit: filters.limit || 20,
        skip: filters.skip || 0
      };

      // Remove undefined values
      Object.keys(params).forEach(
        key => params[key] === undefined && delete params[key]
      );

      console.log('🔍 Search params:', params);

      const response = await api.get('/search/nearby-workers', { params });
      return response.data;
    } catch (error) {
      console.error('Search nearby workers error:', error);
      throw error;
    }
  },

  /**
   * Get worker details with distance
   * 
   * @param {string} workerId - Worker ID
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @returns {Promise} - Worker details
   */
  getWorkerWithDistance: async (workerId, latitude, longitude) => {
    try {
      const params = {
        latitude,
        longitude
      };

      const response = await api.get(`/search/worker/${workerId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get worker error:', error);
      throw error;
    }
  },

  /**
   * Get worker statistics
   * 
   * @param {string} workerId - Worker ID
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @returns {Promise} - Worker stats
   */
  getWorkerStats: async (workerId, latitude, longitude) => {
    try {
      const params = {
        latitude,
        longitude
      };

      const response = await api.get(`/search/worker-stats/${workerId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Get worker stats error:', error);
      throw error;
    }
  },

  /**
   * Get categories statistics
   * 
   * @returns {Promise} - Categories data
   */
  getCategoriesStats: async () => {
    try {
      const response = await api.get('/search/categories/stats');
      return response.data;
    } catch (error) {
      console.error('Get categories stats error:', error);
      throw error;
    }
  }
};

export default searchService;
