import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import searchService from '../services/searchService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { FiMapPin } from 'react-icons/fi';

const WorkerSearch = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Search filters - Initialize with default location or from URL params
  const [filters, setFilters] = useState({
    latitude: parseFloat(searchParams.get('latitude')) || 28.6139,  // Delhi default
    longitude: parseFloat(searchParams.get('longitude')) || 77.2090,
    maxDistance: 10,
    maxPrice: 5000,
    minRating: 0,
    categories: searchParams.get('service') ? [searchParams.get('service')] : [],
    sortBy: 'matchScore'
  });

  const [categories, setCategories] = useState(
    searchParams.get('service') ? [searchParams.get('service')] : []
  );
  const [availableCategories, setAvailableCategories] = useState([]);
  const [capturingLocation, setCapturingLocation] = useState(false);

  // Capture live location
  const captureLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setCapturingLocation(true);
    toast.loading('Getting your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Live location captured:', { latitude, longitude });
        
        setFilters(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        
        toast.dismiss();
        toast.success(`Location updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        setCapturingLocation(false);
      },
      (error) => {
        console.error('❌ Location error:', error);
        toast.dismiss();
        
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        toast.error(errorMessage);
        setCapturingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Fetch available categories on mount
  useEffect(() => {
    console.log('🔍 WorkerSearch component mounted');
    
    const fetchCategories = async () => {
      try {
        console.log('📡 Fetching categories...');
        const response = await searchService.getCategoriesStats();
        console.log('✅ Categories response:', response);
        
        if (response?.data && Array.isArray(response.data)) {
          const cats = response.data.map(cat => cat.category);
          console.log('📦 Available categories:', cats);
          setAvailableCategories(cats);
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          setAvailableCategories(['Plumber', 'Electrician', 'Carpenter', 'Painter']);
        }
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
        // Use default categories if API fails
        setAvailableCategories(['Plumber', 'Electrician', 'Carpenter', 'Painter']);
      }
    };
    
    fetchCategories();

    // Check if service parameter is present in URL (from home page)
    const serviceParam = searchParams.get('service');
    const latParam = searchParams.get('latitude');
    const lngParam = searchParams.get('longitude');

    if (serviceParam || latParam || lngParam) {
      console.log('📍 URL parameters detected:', { serviceParam, latParam, lngParam });
      
      // Trigger automatic search
      setTimeout(() => {
        setSearched(true);
      }, 100);
    }

    // Get user location if available
    if (navigator.geolocation && !latParam) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 Got user location:', position.coords);
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.log('⚠️ Using default location (geolocation error):', error);
        }
      );
    }
    
    // Also try to get from user profile
    if (user?.location?.coordinates && Array.isArray(user.location.coordinates) && !latParam) {
      console.log('👤 User has saved location:', user.location.coordinates);
      setFilters(prev => ({
        ...prev,
        latitude: user.location.coordinates[1],
        longitude: user.location.coordinates[0]
      }));
    }
  }, [user, searchParams]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    console.log('🔍 Starting search with filters:', filters);

    try {
      const searchFilters = {
        maxDistance: parseInt(filters.maxDistance),
        maxPrice: parseInt(filters.maxPrice),
        minRating: parseInt(filters.minRating),
        categories: categories.length > 0 ? categories : undefined,
        sortBy: filters.sortBy,
        limit: 20
      };

      console.log('📡 Sending search request...');
      const response = await searchService.searchNearbyWorkers(
        filters.latitude,
        filters.longitude,
        searchFilters
      );

      console.log('✅ Search response:', response);
      
      const workerList = response?.data?.workers || [];
      console.log(`📦 Found ${workerList.length} workers`);
      
      setWorkers(workerList);
      
      if (workerList.length === 0) {
        setError(null); // No error, just no results
      }
    } catch (err) {
      console.error('❌ Search error details:', err);
      
      // Detailed error logging
      if (err.response?.status === 401) {
        setError('⚠️ You must be logged in to search workers');
      } else if (err.response?.status === 404) {
        setError('❌ Search endpoint not found. Is backend running?');
      } else if (!err.response) {
        setError('❌ Cannot connect to server. Is backend running on localhost:5000?');
      } else {
        setError(err.response?.data?.message || 'Error searching workers. Please try again.');
      }
      
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when URL parameters are detected (from home page search)
  useEffect(() => {
    if (searched && (searchParams.get('service') || searchParams.get('latitude'))) {
      console.log('🔄 Auto-triggering search with URL parameters');
      handleSearch({ preventDefault: () => {} });
    }
  }, [searched]);

  const toggleCategory = (category) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleViewProfile = (workerId) => {
    console.log('👁️ Viewing profile for worker:', workerId);
    navigate(`/workers/${workerId}`);
  };

  const handleBookNow = (workerId) => {
    console.log('📅 Book Now clicked!');
    console.log('   Worker ID:', workerId);
    console.log('   Worker ID type:', typeof workerId);
    console.log('   Is valid:', !!workerId && workerId !== 'undefined');
    
    if (!user) {
      console.log('❌ User not logged in, redirecting to login');
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    
    const bookingUrl = `/bookings/new?workerId=${workerId}`;
    console.log('✅ Navigating to:', bookingUrl);
    navigate(bookingUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Workers</h1>
          <p className="text-gray-600">Search for professional service workers near you</p>
        </div>

        {/* Filters Section - Top/Above (Vertical Layout) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Filters</h2>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📍 Location
              </label>
              <div className="text-xs text-gray-500 mb-2">
                Lat: {filters.latitude.toFixed(4)}, Lon: {filters.longitude.toFixed(4)}
              </div>
              <button
                type="button"
                onClick={captureLiveLocation}
                disabled={capturingLocation}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition duration-200"
              >
                <FiMapPin className="w-4 h-4" />
                {capturingLocation ? 'Getting Location...' : 'Use My Location'}
              </button>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance: {filters.maxDistance} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.maxDistance}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, maxDistance: e.target.value }))
                }
                className="w-full"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price: ₹{filters.maxPrice}
              </label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, maxPrice: e.target.value }))
                }
                className="w-full"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, minRating: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">All Ratings ⭐</option>
                <option value="3">3★ & Above</option>
                <option value="3.5">3.5★ & Above</option>
                <option value="4">4★ & Above</option>
                <option value="4.5">4.5★ & Above</option>
              </select>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableCategories.map(cat => (
                  <label key={cat} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, sortBy: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="matchScore">Best Match</option>
                <option value="distance">Nearest</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>

            {/* Search Button - Full Width */}
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
              >
                {loading ? '🔍 Searching...' : '🔍 Search Workers'}
              </button>
            </div>
          </form>
        </div>

        {/* Main Content - Results */}
        <div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
              ⚠️ {error}
            </div>
          )}

          {!searched && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">👇 Adjust filters and search for workers</p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {searched && !loading && workers.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">😢 No workers found. Try adjusting your filters.</p>
            </div>
          )}

          {/* Workers Grid - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(worker => (
              <div
                key={worker._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 overflow-hidden flex flex-col"
              >
                {/* Profile Picture */}
                <div className="relative h-36 bg-gradient-to-br from-blue-100 to-indigo-100">
                  <img
                    src={worker.profileImage || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={worker.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                  {/* Match Score Badge */}
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-0.5 rounded-full shadow-lg">
                    <span className="text-xs font-bold">{worker.matchScore || 0}%</span>
                  </div>
                  {/* Availability Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                      worker.availability === 'available' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}>
                      {worker.availability === 'available' ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3 flex-1 flex flex-col">
                  {/* Name and Category */}
                  <div className="mb-2">
                    <h3 className="text-base font-bold text-gray-900 mb-0.5 truncate">{worker.name}</h3>
                    <p className="text-blue-600 font-medium text-xs truncate">
                      {worker.categories?.join(', ') || worker.category || 'Service Provider'}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-yellow-50 rounded p-1.5 text-center">
                      <p className="text-xs text-gray-600">⭐</p>
                      <p className="text-xs font-bold text-gray-900">
                        {worker.rating?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded p-1.5 text-center">
                      <p className="text-xs text-gray-600">📍</p>
                      <p className="text-xs font-bold text-gray-900">
                        {worker.distance?.toFixed(1) || 'N/A'} km
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded p-1.5 text-center">
                      <p className="text-xs text-gray-600">💰</p>
                      <p className="text-xs font-bold text-gray-900">
                        ₹{worker.pricePerHour}
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded p-1.5 text-center">
                      <p className="text-xs text-gray-600">📅</p>
                      <p className="text-xs font-bold text-gray-900">
                        {worker.experience || 0}y
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  {worker.skills && worker.skills.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1">
                        {worker.skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {worker.skills.length > 2 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            +{worker.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {worker.location?.city && (
                    <p className="text-gray-500 text-xs mb-2 truncate">
                      📍 {worker.location.city}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => handleViewProfile(worker._id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-2 rounded transition duration-200 text-xs"
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => handleBookNow(worker._id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-2 rounded transition duration-200 text-xs"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

            {/* Pagination Info */}
            {searched && workers.length > 0 && (
              <div className="mt-6 text-center text-gray-600">
                <p>Showing {workers.length} workers</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default WorkerSearch;
