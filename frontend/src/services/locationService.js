// Location Service for capturing user's live location

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
  }

  /**
   * Get current position once
   * @returns {Promise<{latitude, longitude, accuracy, address}>}
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };

          this.currentPosition = location;

          // Get address from coordinates using reverse geocoding
          try {
            const address = await this.reverseGeocode(location.latitude, location.longitude);
            location.address = address;
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
          }

          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Watch position continuously
   * @param {Function} onUpdate - Callback function called when position updates
   * @param {Function} onError - Callback function called on error
   */
  watchPosition(onUpdate, onError) {
    if (!navigator.geolocation) {
      onError(new Error('Geolocation is not supported by this browser'));
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        };

        this.currentPosition = location;

        // Get address from coordinates
        try {
          const address = await this.reverseGeocode(location.latitude, location.longitude);
          location.address = address;
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }

        onUpdate(location);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        onError(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Accept cached position up to 30 seconds old
      }
    );
  }

  /**
   * Stop watching position
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<string>}
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (data.address) {
        const parts = [];
        if (data.address.road) parts.push(data.address.road);
        if (data.address.suburb) parts.push(data.address.suburb);
        if (data.address.city) parts.push(data.address.city);
        if (data.address.state) parts.push(data.address.state);
        if (data.address.postcode) parts.push(data.address.postcode);
        
        return {
          fullAddress: data.display_name,
          shortAddress: parts.join(', '),
          city: data.address.city || data.address.town || data.address.village || '',
          state: data.address.state || '',
          pincode: data.address.postcode || '',
          country: data.address.country || ''
        };
      }

      return {
        fullAddress: data.display_name || 'Address not found',
        shortAddress: '',
        city: '',
        state: '',
        pincode: '',
        country: ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        shortAddress: '',
        city: '',
        state: '',
        pincode: '',
        country: ''
      };
    }
  }

  /**
   * Check if geolocation is supported
   * @returns {boolean}
   */
  isSupported() {
    return 'geolocation' in navigator;
  }

  /**
   * Request location permission
   * @returns {Promise<string>} - 'granted', 'denied', or 'prompt'
   */
  async checkPermission() {
    if (!navigator.permissions) {
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.error('Permission check error:', error);
      return 'prompt';
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} - Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Get current position if already cached
   * @returns {object|null}
   */
  getCachedPosition() {
    return this.currentPosition;
  }
}

// Export singleton instance
export default new LocationService();
