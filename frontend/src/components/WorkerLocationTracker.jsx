import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { FiNavigation, FiMapPin, FiPhone, FiUser, FiClock } from 'react-icons/fi';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const workerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const WorkerLocationTracker = ({ bookingId, booking, onClose }) => {
  const [workerLocation, setWorkerLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchWorkerLocation();

    // Set up polling every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchWorkerLocation();
    }, 5000);

    // Set up Socket.IO connection for real-time updates
    setupSocketConnection();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [bookingId]);

  const setupSocketConnection = () => {
    try {
      const token = localStorage.getItem('token');
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      socket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO for location tracking');
      });

      socket.on('workerLocationUpdate', (data) => {
        if (data.bookingId === bookingId) {
          console.log('📍 Real-time location update:', data);
          setWorkerLocation({
            latitude: data.workerLocation.latitude,
            longitude: data.workerLocation.longitude
          });
          setLastUpdate(new Date(data.workerLocation.timestamp));
        }
      });

      socket.on('bookingStatusChanged', (data) => {
        if (data.bookingId === bookingId) {
          toast.success(data.message);
          if (data.status === 'in-progress') {
            toast.success('🚀 Worker has arrived and started the job!');
          } else if (data.status === 'completed') {
            toast.success('✅ Job completed!');
            onClose && onClose();
          }
        }
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  const fetchWorkerLocation = async () => {
    try {
      const response = await apiService.booking.getWorkerLocation(bookingId);
      const data = response.data;

      if (data.worker?.location?.coordinates) {
        setWorkerLocation({
          latitude: data.worker.location.coordinates[1],
          longitude: data.worker.location.coordinates[0]
        });
      }

      if (data.userLocation?.coordinates) {
        setUserLocation({
          latitude: data.userLocation.coordinates[1],
          longitude: data.userLocation.coordinates[0]
        });
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch worker location:', error);
      if (loading) {
        toast.error('Unable to track worker location');
        setLoading(false);
      }
    }
  };

  const calculateDistance = () => {
    if (!workerLocation || !userLocation) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (userLocation.latitude - workerLocation.latitude) * Math.PI / 180;
    const dLon = (userLocation.longitude - workerLocation.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(workerLocation.latitude * Math.PI / 180) * Math.cos(userLocation.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(2)} km`;
  };

  const getETA = () => {
    if (!workerLocation || !userLocation) return null;
    const distance = parseFloat(calculateDistance());
    const avgSpeed = 30; // km/h average speed
    const timeInMinutes = (distance / avgSpeed) * 60;
    return Math.round(timeInMinutes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!workerLocation) {
    return (
      <div className="text-center py-12">
        <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Worker location not available</p>
      </div>
    );
  }

  const centerLat = workerLocation && userLocation
    ? (workerLocation.latitude + userLocation.latitude) / 2
    : workerLocation.latitude;
  const centerLon = workerLocation && userLocation
    ? (workerLocation.longitude + userLocation.longitude) / 2
    : workerLocation.longitude;

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FiNavigation className="animate-pulse" />
              {booking?.status === 'on-the-way' ? 'Worker is on the way!' : 'Job in Progress'}
            </h3>
            <p className="text-sm opacity-90">
              {booking?.worker?.name} • {booking?.serviceType}
            </p>
          </div>
          <div className="text-right">
            {calculateDistance() && (
              <div className="text-2xl font-bold">{calculateDistance()}</div>
            )}
            {getETA() && (
              <div className="text-sm opacity-90">ETA: {getETA()} mins</div>
            )}
          </div>
        </div>
      </div>

      {/* Live Map */}
      <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg" style={{ height: '400px' }}>
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Worker Marker */}
          {workerLocation && (
            <Marker
              position={[workerLocation.latitude, workerLocation.longitude]}
              icon={workerIcon}
            >
              <Popup>
                <div className="text-center">
                  <FiUser className="inline-block mb-2 text-blue-600" size={20} />
                  <p className="font-bold">{booking?.worker?.name}</p>
                  <p className="text-sm text-gray-600">Worker Location</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {lastUpdate?.toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* User Destination Marker */}
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-center">
                  <FiMapPin className="inline-block mb-2 text-green-600" size={20} />
                  <p className="font-bold">Your Location</p>
                  <p className="text-sm text-gray-600">{booking?.location?.address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Path Line */}
          {workerLocation && userLocation && (
            <Polyline
              positions={[
                [workerLocation.latitude, workerLocation.longitude],
                [userLocation.latitude, userLocation.longitude]
              ]}
              color="blue"
              weight={3}
              opacity={0.6}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FiPhone />
            <span className="text-sm font-medium">Contact Worker</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{booking?.worker?.phone}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FiClock />
            <span className="text-sm font-medium">Last Update</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live tracking active</span>
      </div>
    </div>
  );
};

export default WorkerLocationTracker;
