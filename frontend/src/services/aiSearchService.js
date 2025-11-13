/**
 * AI-POWERED SEARCH SERVICE
 * Enhanced search with natural language understanding
 */

import api from './api';

export const aiSearchService = {
  /**
   * Intelligent search with NLP
   * @param {string} query - Natural language query
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {object} options - Additional options
   */
  smartSearch: async (query, latitude, longitude, options = {}) => {
    try {
      const params = {
        query,
        latitude,
        longitude,
        maxDistance: options.maxDistance || 20,
        limit: options.limit || 10
      };

      console.log('🤖 AI Search:', query);
      const response = await api.get('/ai-search/search', { params });
      
      return {
        success: true,
        workers: response.data.data.results,
        metadata: {
          totalFound: response.data.data.totalFound,
          explanation: response.data.data.explanation,
          confidence: response.data.data.confidence,
          searchMode: response.data.data.searchMode
        }
      };
    } catch (error) {
      console.error('AI Search error:', error);
      throw error;
    }
  },

  /**
   * Get search suggestions
   * @param {string} partial - Partial query text
   */
  getSuggestions: async (partial) => {
    try {
      if (!partial || partial.length < 2) return [];
      
      const response = await api.get('/ai-search/suggestions', {
        params: { partial }
      });
      
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  },

  /**
   * Get trending searches
   */
  getTrending: async () => {
    try {
      const response = await api.get('/ai-search/trending');
      return response.data.trending || [];
    } catch (error) {
      console.error('Trending error:', error);
      return [];
    }
  }
};

export default aiSearchService;
