/**
 * AI SEARCH INTERFACE COMPONENT
 * Conversational search interface with real-time suggestions
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Sparkles, MapPin, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { useLocation } from '../hooks/useLocation';

const AISearchInterface = ({ onResultsFound }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { latitude, longitude, locationLoading } = useLocation();
  const suggestionTimeout = useRef(null);

  // Fetch suggestions as user types
  const fetchSuggestions = useCallback(async (input) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get('/api/ai-search/suggestions', {
        params: { partial: input }
      });

      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
      }
    } catch (err) {
      console.error('❌ Error fetching suggestions:', err);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }

    // Debounce suggestions
    suggestionTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Perform AI search
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    if (!latitude || !longitude) {
      setError('Location not available. Please enable location services.');
      return;
    }

    setSearching(true);
    setError(null);
    setResults(null);

    try {
      console.log(`🤖 Searching for: "${searchQuery}"`);
      console.log(`📍 Location: ${latitude}, ${longitude}`);

      const response = await axios.get('/api/ai-search/search', {
        params: {
          query: searchQuery,
          latitude,
          longitude,
          limit: 10
        }
      });

      if (response.data.success) {
        setResults(response.data.data);
        console.log('✅ Search results:', response.data.data);

        // Call parent callback if provided
        if (onResultsFound) {
          onResultsFound(response.data.data);
        }
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Search failed';
      setError(errorMsg);
      console.error('❌ Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* AI Search Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">AI-Powered Search</h3>
        </div>
        <p className="text-sm text-gray-600">
          Describe what you need in conversational language. Our AI will understand and find the perfect match.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => query.length > 1 && setSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="E.g., 'I need a plumber near me' or 'Find an electrician within 5km'"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              disabled={locationLoading}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2 text-sm transition"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={searching || locationLoading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 transition font-medium flex items-center gap-2"
          >
            {searching ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>

        {locationLoading && (
          <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Getting your location...
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Search Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Query Explanation */}
      {results && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>🤖 Query Understood:</strong> {results.explanation}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs text-blue-700">
            <span>Confidence: {results.confidence}%</span>
            <span>Mode: {results.searchMode}</span>
            <span>Found: {results.totalFound} results</span>
          </div>
        </div>
      )}

      {/* Results */}
      {results && results.results.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Best Matches ({results.results.length})
          </h4>

          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {results.results.map((worker, index) => (
              <div
                key={worker._id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex gap-3">
                  {worker.profilePicture && (
                    <img
                      src={worker.profilePicture}
                      alt={worker.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="font-semibold text-gray-800">{worker.name}</h5>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-purple-600">
                            {worker.relevanceScore}%
                          </span>
                          <span className="text-xs text-gray-500">Match</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {worker.serviceCategories?.join(', ')}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                      {worker.averageRating && (
                        <span className="flex items-center gap-1">
                          ⭐ {worker.averageRating.toFixed(1)} ({worker.totalReviews})
                        </span>
                      )}
                      {worker.experienceYears && (
                        <span>{worker.experienceYears}+ years exp</span>
                      )}
                      {worker.hourlyRate && (
                        <span className="font-semibold text-green-600">
                          ₹{worker.hourlyRate}/hr
                        </span>
                      )}
                    </div>

                    {worker.searchMetadata?.distance && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {worker.searchMetadata.distance.toFixed(1)} km away
                      </div>
                    )}

                    {worker.bio && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{worker.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {results && results.results.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-yellow-800 font-semibold">No matches found</p>
          <p className="text-sm text-yellow-700 mt-1">
            Try a different search query or adjust your filters
          </p>
        </div>
      )}
    </div>
  );
};

export default AISearchInterface;
