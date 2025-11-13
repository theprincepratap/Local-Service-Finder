/**
 * useLocation Hook
 * Manages user geolocation with error handling and caching
 */

import { useState, useEffect } from 'react';

export const useLocation = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Try to get cached location first
    const cachedLocation = localStorage.getItem('userLocation');
    const cacheTime = localStorage.getItem('locationCacheTime');
    const now = Date.now();

    // Use cache if it's less than 5 minutes old
    if (cachedLocation && cacheTime && (now - parseInt(cacheTime) < 5 * 60 * 1000)) {
      const { lat, lng, acc } = JSON.parse(cachedLocation);
      setLatitude(lat);
      setLongitude(lng);
      setAccuracy(acc);
      setLocationLoading(false);
      console.log('📍 Using cached location');
      return;
    }

    // Get fresh location
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    console.log('📍 Requesting location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        setAccuracy(acc);
        setLocationLoading(false);

        // Cache location
        localStorage.setItem(
          'userLocation',
          JSON.stringify({ lat, lng, acc })
        );
        localStorage.setItem('locationCacheTime', now.toString());

        console.log(`✅ Location obtained: ${lat}, ${lng} (accuracy: ${acc}m)`);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable it in settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }

        setLocationError(errorMessage);
        setLocationLoading(false);
        console.error('❌ Location error:', errorMessage);

        // Try to use cached location as fallback
        if (cachedLocation) {
          const { lat, lng, acc } = JSON.parse(cachedLocation);
          setLatitude(lat);
          setLongitude(lng);
          setAccuracy(acc);
          console.log('📍 Using cached location as fallback');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  return {
    latitude,
    longitude,
    accuracy,
    locationLoading,
    locationError
  };
};
