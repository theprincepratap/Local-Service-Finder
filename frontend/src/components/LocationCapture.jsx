import { useState, useEffect } from 'react';
import { FiMapPin, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const LocationCapture = ({ onLocationCapture, required = false, className = '' }) => {
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false); // Prevent duplicate requests

  const requestLocation = () => {
    // Prevent duplicate simultaneous requests
    if (isRequesting) {
      console.log('⚠️ Location request already in progress, skipping...');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsRequesting(true);
    setLocationStatus('loading');
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [longitude, latitude]; // GeoJSON format: [lng, lat]
        
        setCoordinates(coords);
        setLocationStatus('success');
        setIsRequesting(false);
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const fetchedAddress = data.display_name || 'Address not available';
          setAddress(fetchedAddress);
          
          // Send location data to parent component
          onLocationCapture({
            coordinates: coords,
            address: fetchedAddress,
            latitude,
            longitude
          });

          toast.success('Location captured successfully!');
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setAddress('Address lookup failed');
          
          // Still send coordinates even if address lookup fails
          onLocationCapture({
            coordinates: coords,
            address: '',
            latitude,
            longitude
          });
          
          toast.success('Location captured (address lookup partial)');
        }
      },
      (error) => {
        setLocationStatus('error');
        setIsRequesting(false);
        let errorMessage = '';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    // Auto-request location if required (only once on mount)
    if (required && locationStatus === 'idle') {
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const getStatusIcon = () => {
    switch (locationStatus) {
      case 'loading':
        return <FiLoader className="animate-spin text-blue-600" />;
      case 'success':
        return <FiCheckCircle className="text-green-600" />;
      case 'error':
        return <FiAlertCircle className="text-red-600" />;
      default:
        return <FiMapPin className="text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (locationStatus) {
      case 'loading':
        return 'Getting your location...';
      case 'success':
        return 'Location captured';
      case 'error':
        return error;
      default:
        return 'Click to capture your current location';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Live Location {required && <span className="text-red-500">*</span>}
        </label>
        {locationStatus === 'success' && coordinates && (
          <span className="text-xs text-green-600 font-medium">
            ✓ Captured
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={requestLocation}
        disabled={locationStatus === 'loading'}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-all duration-200 ${
          locationStatus === 'success'
            ? 'border-green-300 bg-green-50 hover:bg-green-100'
            : locationStatus === 'error'
            ? 'border-red-300 bg-red-50 hover:bg-red-100'
            : locationStatus === 'loading'
            ? 'border-blue-300 bg-blue-50 cursor-wait'
            : 'border-gray-300 bg-white hover:bg-gray-50'
        } ${locationStatus === 'loading' ? 'cursor-wait' : 'cursor-pointer'}`}
      >
        <div className="flex items-center space-x-3">
          <div className="text-xl">{getStatusIcon()}</div>
          <div className="text-left">
            <div className={`text-sm font-medium ${
              locationStatus === 'success'
                ? 'text-green-700'
                : locationStatus === 'error'
                ? 'text-red-700'
                : 'text-gray-700'
            }`}>
              {getStatusText()}
            </div>
            {coordinates && (
              <div className="text-xs text-gray-500 mt-1">
                Lat: {coordinates[1].toFixed(6)}, Lng: {coordinates[0].toFixed(6)}
              </div>
            )}
          </div>
        </div>
        {locationStatus !== 'loading' && locationStatus !== 'success' && (
          <FiMapPin className="text-gray-400" />
        )}
      </button>

      {address && locationStatus === 'success' && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Detected Address:</p>
          <p className="text-sm text-gray-700">{address}</p>
        </div>
      )}

      {error && locationStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-700 flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Why we need this:</strong> We use your location to show you relevant services nearby and help workers find jobs in their area.
        </p>
      </div>
    </div>
  );
};

export default LocationCapture;
