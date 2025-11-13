/**
 * WORKER DASHBOARD SERVICE
 * Fetches real data from MongoDB via API
 */

import api from './api';

export const workerDashboardService = {
  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats with earnings, active jobs, ratings, etc.
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/worker/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  /**
   * Get pending job requests
   * @returns {Promise} Array of pending bookings
   */
  getPendingRequests: async () => {
    try {
      const response = await api.get('/worker/dashboard/pending-requests');
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      throw error;
    }
  },

  /**
   * Get today's schedule
   * @returns {Promise} Array of today's scheduled jobs
   */
  getTodaySchedule: async () => {
    try {
      const response = await api.get('/worker/dashboard/schedule');
      return response.data;
    } catch (error) {
      console.error('Get today schedule error:', error);
      throw error;
    }
  },

  /**
   * Get active jobs
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @returns {Promise} Paginated active jobs
   */
  getActiveJobs: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/worker/dashboard/active-jobs', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get active jobs error:', error);
      throw error;
    }
  },

  /**
   * Get job history
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @param {string} status - Filter by status (optional)
   * @returns {Promise} Paginated job history
   */
  getJobHistory: async (page = 1, limit = 10, status = null) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      
      const response = await api.get('/worker/dashboard/job-history', { params });
      return response.data;
    } catch (error) {
      console.error('Get job history error:', error);
      throw error;
    }
  },

  /**
   * Get worker reviews
   * @param {number} page - Page number for pagination
   * @param {number} limit - Items per page
   * @returns {Promise} Paginated reviews
   */
  getWorkerReviews: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/worker/dashboard/reviews', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get reviews error:', error);
      throw error;
    }
  },

  /**
   * Get earnings details
   * @param {string} period - 'day', 'week', 'month', or 'year'
   * @returns {Promise} Earnings breakdown for the period
   */
  getEarningsDetails: async (period = 'month') => {
    try {
      const response = await api.get('/worker/dashboard/earnings', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get earnings details error:', error);
      throw error;
    }
  }
};

export default workerDashboardService;
