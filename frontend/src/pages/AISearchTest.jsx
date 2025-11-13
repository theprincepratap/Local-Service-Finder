import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import aiSearchService from '../services/aiSearchService';

/**
 * AI SEARCH TEST PAGE
 * Demonstrates natural language search capabilities
 */
const AISearchTest = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);

  // Default user location (Bangalore center)
  const [userLocation] = useState({
    latitude: 12.9716,
    longitude: 77.5946
  });

  // Example queries
  const exampleQueries = [
    'Find a plumber in Koramangala',
    'I need an electrician near Indiranagar',
    'Affordable carpenter in HSR Layout',
    'Best painter in Whitefield',
    'Urgent AC repair in BTM',
    'Cleaner in Jayanagar',
    'Experienced plumber in Marathahalli',
  ];

  // Load trending searches on mount
  useEffect(() => {
    loadTrending();
  }, []);

  // Get suggestions as user types
  useEffect(() => {
    if (query.length >= 2) {
      loadSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const loadTrending = async () => {
    try {
      const trends = await aiSearchService.getTrending();
      setTrending(trends);
    } catch (error) {
      console.error('Failed to load trending:', error);
    }
  };

  const loadSuggestions = async (text) => {
    try {
      const suggestions = await aiSearchService.getSuggestions(text);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setResults([]);
      setMetadata(null);

      const response = await aiSearchService.smartSearch(
        query,
        userLocation.latitude,
        userLocation.longitude,
        { maxDistance: 20, limit: 10 }
      );

      setResults(response.workers);
      setMetadata(response.metadata);

      if (response.workers.length === 0) {
        toast.error('No workers found for your query');
      } else {
        toast.success(`Found ${response.workers.length} workers!`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useExampleQuery = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🤖 AI-Powered Worker Search
          </h1>
          <p className="text-xl text-gray-600">
            Search using natural language - Just type what you need!
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Try: "Find a plumber in Koramangala"'
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-semibold text-lg shadow-lg"
              >
                {loading ? '🔍 Searching...' : '🔍 Search'}
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">💡 Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(suggestion)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-blue-50 hover:border-blue-500"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Example Queries */}
          <div className="border-t pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              📋 Try these examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => useExampleQuery(example)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata */}
        {metadata && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🎯 Search Intelligence
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Explanation</p>
                <p className="font-semibold text-gray-900">{metadata.explanation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Found</p>
                <p className="font-semibold text-gray-900">{metadata.totalFound}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="font-semibold text-gray-900">{metadata.confidence}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Search Mode</p>
                <p className="font-semibold text-gray-900 capitalize">{metadata.searchMode}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((worker) => (
            <div
              key={worker._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{worker.name}</h3>
                    <p className="text-sm text-gray-600">{worker.categories?.join(', ')}</p>
                  </div>
                  {worker.relevanceScore && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {worker.relevanceScore} pts
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">💰 Price:</span>
                    <span className="ml-2 font-semibold">₹{worker.pricePerHour}/hr</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">⭐ Rating:</span>
                    <span className="ml-2 font-semibold">{worker.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">🔧 Experience:</span>
                    <span className="ml-2 font-semibold">{worker.experience} years</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600">📍 Location:</span>
                    <span className="ml-2 font-semibold truncate">
                      {worker.location?.area || worker.location?.address || 'N/A'}
                    </span>
                  </div>
                  {worker.searchMetadata?.distance && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">📏 Distance:</span>
                      <span className="ml-2 font-semibold">
                        {worker.searchMetadata.distance.toFixed(1)} km
                      </span>
                    </div>
                  )}
                </div>

                <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-600">Try adjusting your search query or location</p>
          </div>
        )}

        {/* Trending */}
        {trending.length > 0 && !query && (
          <div className="mt-12 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Trending Searches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trending.map((trend, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(trend)}
                  className="px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-left border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <span className="text-gray-700">{trend}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISearchTest;
