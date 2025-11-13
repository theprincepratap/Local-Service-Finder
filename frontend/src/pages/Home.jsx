import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

try {
  var { FiSearch, FiMapPin, FiArrowRight, FiLoader, FiAlertCircle, FiHelpCircle } = require('react-icons/fi');
} catch (err) {
  console.warn('Icons failed to load, using alternatives');
  FiSearch = () => <span>🔍</span>;
  FiMapPin = () => <span>📍</span>;
  FiArrowRight = () => <span>→</span>;
  FiLoader = () => <span>⏳</span>;
  FiAlertCircle = () => <span>⚠️</span>;
  FiHelpCircle = () => <span>❓</span>;
}

const Home = () => {
  console.log('🏠 Home component rendering');
  
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showLocationHelp, setShowLocationHelp] = useState(false);

  const services = [
    'Plumber',
    'Electrician',
    'Carpenter',
    'Cleaner',
    'Painter',
    'AC Repair',
    'Plumbing',
    'Gardener',
    'Handyman',
    'Locksmith',
  ];

  const categories = [
    { name: 'Plumber', icon: '🔧', count: 150 },
    { name: 'Electrician', icon: '⚡', count: 120 },
    { name: 'Carpenter', icon: '🔨', count: 90 },
    { name: 'Cleaner', icon: '🧹', count: 200 },
    { name: 'Painter', icon: '🎨', count: 80 },
    { name: 'AC Repair', icon: '❄️', count: 60 },
  ];

  // Predefined major cities with coordinates for quick selection
  const majorCities = {
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  };

  const captureLocation = () => {
    setLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('❌ Geolocation not supported. Please manually select your city below.');
      setLoadingLocation(false);
      setShowLocationHelp(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        
        // Try to get location name from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { signal: AbortSignal.timeout(5000) }
          );
          const data = await response.json();
          const address = data.address?.city || data.address?.town || data.address?.village || 'Current Location';
          setLocationName(address);
          toast.success(`✅ Location captured: ${address}`);
        } catch (err) {
          console.log('Could not get location name, using coordinates');
          setLocationName(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          toast.success('✅ Location captured from GPS');
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        
        // Provide user-friendly error messages based on error code
        let errorMessage = '❌ Failed to capture location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = '❌ Location access denied. Please enable it in your browser settings or select a city below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = '❌ Location unavailable. Please select a city below or enable GPS.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = '❌ Location request timed out. Please select a city below.';
        }
        
        toast.error(errorMessage);
        setShowLocationHelp(true);
        setLoadingLocation(false);
      }
    );
  };

  const selectQuickCity = (cityName) => {
    const city = majorCities[cityName];
    if (city) {
      setLatitude(city.lat);
      setLongitude(city.lng);
      setLocationName(cityName);
      toast.success(`✅ Selected ${cityName}`);
      setShowLocationHelp(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!selectedService) {
      toast.error('❌ Please select a service');
      return;
    }

    if (!locationName) {
      toast.error('❌ Please capture or select your location');
      return;
    }

    // If coordinates not available, try to geocode the location name
    if (!latitude || !longitude) {
      // Try to find city in our predefined list
      if (majorCities[locationName]) {
        const city = majorCities[locationName];
        setLatitude(city.lat);
        setLongitude(city.lng);
        
        // Recursive call to handle search after setting coordinates
        setTimeout(() => {
          const params = new URLSearchParams({
            service: selectedService,
            latitude: city.lat,
            longitude: city.lng,
            location: locationName
          });
          navigate(`/workers?${params.toString()}`);
        }, 100);
        return;
      }
      
      toast.error('❌ Could not determine coordinates. Please use the "Capture Location" button.');
      return;
    }

    // Build query string
    const params = new URLSearchParams({
      service: selectedService,
      latitude: latitude,
      longitude: longitude,
      ...(locationName && { location: locationName })
    });

    // Navigate to worker search with parameters
    navigate(`/workers?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Trusted Local Workers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Hire skilled professionals for all your home service needs
            </p>
            
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-6 space-y-4">
                {/* Service Dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Service
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">-- Choose a service --</option>
                      {services.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                    {selectedService && (
                      <p className="text-sm text-green-600 mt-1">✓ {selectedService} selected</p>
                    )}
                  </div>

                  {/* Location Display */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Location
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 flex items-center gap-2">
                      <FiMapPin className="text-red-500 text-lg flex-shrink-0" />
                      <span className="truncate text-sm">
                        {locationName || 'No location captured'}
                      </span>
                    </div>
                  </div>

                  {/* Capture Location Button */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Actions
                    </label>
                    <button
                      type="button"
                      onClick={captureLocation}
                      disabled={loadingLocation}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      {loadingLocation ? (
                        <>
                          <FiLoader className="animate-spin" />
                          Capturing...
                        </>
                      ) : (
                        <>
                          <FiMapPin />
                          Capture Location
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Location Help Section */}
                {showLocationHelp && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <FiHelpCircle className="text-blue-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-3">💡 Can't use GPS? Select your city:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.keys(majorCities).map(city => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => selectQuickCity(city)}
                              className="bg-white hover:bg-blue-100 border border-blue-300 text-blue-700 px-3 py-2 rounded text-xs font-medium transition"
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                          📌 Your location helps us find workers near you. We respect your privacy.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Location Input Option */}
                <div className="border-t border-gray-200 pt-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      🌍 Prefer to enter location manually?
                    </summary>
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manual City/Location Entry:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your city name or address..."
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-2">
                        ℹ️ For precise searches, use the GPS button above. Manual entry uses city center coordinates.
                      </p>
                    </div>
                  </details>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-lg"
                >
                  <FiSearch />
                  Search Workers
                </button>

                {/* Info Message */}
                {latitude && longitude && (
                  <p className="text-xs text-gray-600 text-center">
                    📍 Searching from coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-gray-600">
              Find the right professional for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/workers?category=${category.name}`}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer text-center"
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.count}+ workers</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600">
              Three simple steps to get your work done
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-gray-600">
                Find workers near you based on service type and ratings
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Book</h3>
              <p className="text-gray-600">
                Choose your worker and book a convenient time slot
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Work Done</h3>
              <p className="text-gray-600">
                Relax while professionals handle your service needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Are you a skilled worker?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our platform and connect with customers in your area
          </p>
          <Link
            to="/register/worker"
            className="inline-flex items-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition text-lg"
          >
            Register as Worker →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
