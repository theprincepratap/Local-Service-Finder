import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { workerService, bookingService } from '../services/apiService';
import { toast } from 'react-hot-toast';
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUser,
  FiArrowLeft,
  FiCheck,
} from 'react-icons/fi';

const BookingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get('workerId');

  // States
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation, 3: Payment
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [capturingLocation, setCapturingLocation] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    serviceType: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 1,
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
    },
    description: '',
  });

  // Get user's current location on mount
  useEffect(() => {
    console.log('🎯 BookingPage mounted');
    console.log('👤 User:', user?._id);
    console.log('📍 URL:', window.location.href);
    console.log('📋 Search params:', Object.fromEntries(searchParams));
    
    if (!user) {
      console.log('❌ No user logged in, redirecting to login');
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }

    if (!workerId) {
      console.log('❌ No worker ID in URL');
      toast.error('Worker ID not provided');
      navigate('/workers');
      return;
    }

    console.log('✅ Valid workerId found:', workerId);

    // Fetch worker details
    const fetchWorker = async () => {
      try {
        console.log('🔄 Fetching worker details for ID:', workerId);
        const data = await workerService.getWorkerById(workerId);
        console.log('✅ Worker data received:', data);
        
        // Handle both direct worker object and nested format
        const workerData = data.worker || data.data?.worker || data;
        setWorker(workerData);
        
        setFormData(prev => ({
          ...prev,
          serviceType: workerData.categories?.[0] || '',
        }));
        console.log('✅ Form data updated with worker info');
      } catch (err) {
        console.error('❌ Error fetching worker details:');
        console.error('   Status:', err.response?.status);
        console.error('   Message:', err.response?.data?.message);
        console.error('   Full URL:', err.config?.url);
        console.error('   Error:', err);
        
        if (err.response?.status === 404) {
          toast.error(`Worker not found (ID: ${workerId})`);
        } else if (err.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
          navigate('/login');
          return;
        } else {
          toast.error('Failed to load worker details. Please try again.');
        }
        navigate('/workers');
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const address = data.address?.road || data.address?.city || '';
            const city = data.address?.city || '';
            const state = data.address?.state || '';
            const pincode = data.address?.postcode || '';

            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                city,
                state,
                pincode,
              },
            }));
            setUserLocation(address || city);
          } catch (err) {
            console.log('Could not get location name');
          }
        },
        () => {
          console.log('Location permission denied');
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Calculate total price
  const calculatePrice = () => {
    if (!worker || !formData.estimatedDuration) return 0;
    return worker.pricePerHour * formData.estimatedDuration;
  };

  const platformFee = calculatePrice() * 0.05; // 5% platform fee
  const totalPrice = calculatePrice() + platformFee;

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location_')) {
      const field = name.replace('location_', '');
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from today)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Capture user's current location for service address
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setCapturingLocation(true);
    toast.loading('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Location captured:', { latitude, longitude });

        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          const address = data.address?.road || data.display_name || '';
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          const pincode = data.address?.postcode || '';

          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              address: address,
              city: city,
              state: state,
              pincode: pincode,
            },
          }));

          toast.dismiss();
          toast.success('Location captured successfully!');
          console.log('✅ Address updated:', { address, city, state, pincode });
        } catch (error) {
          console.error('❌ Error fetching address:', error);
          toast.dismiss();
          toast.error('Could not fetch address. Please enter manually.');
        } finally {
          setCapturingLocation(false);
        }
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
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

  // Step 1: Form
  const FormStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Type
        </label>
        <select
          name="serviceType"
          value={formData.serviceType}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select service type</option>
          {worker?.categories?.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date
          </label>
          <input
            type="date"
            name="scheduledDate"
            value={formData.scheduledDate}
            onChange={handleInputChange}
            min={getMinDate()}
            max={getMaxDate()}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time
          </label>
          <input
            type="time"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (hours)
          </label>
          <select
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
              <option key={hours} value={hours}>
                {hours} hour{hours > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Service Address
          </label>
          <button
            type="button"
            onClick={handleCaptureLocation}
            disabled={capturingLocation}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition duration-200"
          >
            <FiMapPin className="w-4 h-4" />
            {capturingLocation ? 'Capturing...' : 'Use My Location'}
          </button>
        </div>
        <input
          type="text"
          name="location_address"
          value={formData.location.address}
          onChange={handleInputChange}
          placeholder="Enter full address"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="location_city"
            value={formData.location.city}
            onChange={handleInputChange}
            placeholder="City"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="location_pincode"
            value={formData.location.pincode}
            onChange={handleInputChange}
            placeholder="Pincode"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input
            type="text"
            name="location_state"
            value={formData.location.state}
            onChange={handleInputChange}
            placeholder="State"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="location_landmark"
            value={formData.location.landmark}
            onChange={handleInputChange}
            placeholder="Landmark (optional)"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe what work needs to be done..."
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Price Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Service Rate:</span>
            <span>₹{worker?.pricePerHour || 0}/hour</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{formData.estimatedDuration} hours</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Subtotal:</span>
            <span>₹{calculatePrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Platform Fee (5%):</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span className="text-blue-600">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        {/* Wallet Balance */}
        <div className="mt-4 pt-4 border-t border-blue-300">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Your Wallet Balance:</span>
            <span className="text-lg font-bold text-green-600">₹{user?.wallet?.toLocaleString() || 50000}</span>
          </div>
          {user?.wallet < totalPrice && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              ⚠️ Insufficient balance. Please add funds to your wallet.
            </div>
          )}
          {user?.wallet >= totalPrice && (
            <div className="mt-2 text-xs text-green-700">
              ✓ Balance after booking: ₹{(user?.wallet - totalPrice).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={() => {
          if (!formData.scheduledDate || !formData.scheduledTime || !formData.location.address) {
            toast.error('Please fill all required fields');
            return;
          }
          setStep(2);
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
      >
        Continue to Review
      </button>
    </div>
  );

  // Step 2: Confirmation
  const ConfirmationStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Confirm Booking</h2>

      {/* Worker Info */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FiUser className="w-5 h-5" /> Service Provider
        </h3>
        <p className="text-lg font-semibold text-gray-900">{worker?.userId?.name}</p>
        <p className="text-gray-600">{worker?.categories?.join(', ')}</p>
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date & Time */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FiCalendar className="w-5 h-5" /> When
          </h3>
          <p className="text-gray-900 font-medium">
            {new Date(formData.scheduledDate).toLocaleDateString()}
          </p>
          <p className="text-gray-600">{formData.scheduledTime}</p>
          <p className="text-sm text-gray-500 mt-1">
            Duration: {formData.estimatedDuration} hour{formData.estimatedDuration > 1 ? 's' : ''}
          </p>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FiMapPin className="w-5 h-5" /> Where
          </h3>
          <p className="text-gray-900 font-medium">{formData.location.address}</p>
          <p className="text-gray-600">
            {formData.location.city} {formData.location.pincode}
          </p>
        </div>
      </div>

      {/* Service Description */}
      {formData.description && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Service Details</h3>
          <p className="text-gray-700">{formData.description}</p>
        </div>
      )}

      {/* Price Summary - Detailed */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-3">Final Price</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Service Rate:</span>
            <span>₹{worker?.pricePerHour || 0} × {formData.estimatedDuration}h</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Subtotal:</span>
            <span>₹{calculatePrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Platform Fee (5%):</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total Amount:</span>
            <span className="text-blue-600">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        {/* Wallet Balance Info */}
        <div className="mt-4 pt-4 border-t border-blue-300">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Current Wallet Balance:</span>
            <span className="text-lg font-bold text-green-600">₹{user?.wallet?.toLocaleString() || 50000}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Balance After Payment:</span>
            <span className="text-lg font-bold text-orange-600">₹{((user?.wallet || 50000) - totalPrice).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          ✓ By confirming, you agree to our service terms and conditions.
        </p>
        <p className="text-sm text-gray-600">
          ✓ Payment will be processed securely.
        </p>
        <p className="text-sm text-gray-600">
          ✓ Worker will receive notification immediately after payment.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setStep(1)}
          className="border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {submitting ? 'Processing...' : 'Proceed to Payment →'}
        </button>
      </div>
    </div>
  );

  // Step 3: Payment
  const PaymentStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment</h2>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <FiClock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-semibold">{formData.estimatedDuration} hrs</p>
          </div>
          <div className="text-center">
            <FiDollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-semibold">₹{totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Payment Method</h3>
          
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 border-blue-300 rounded-lg cursor-pointer bg-blue-50">
              <input type="radio" name="payment" defaultChecked className="mr-3 w-4 h-4" />
              <div className="flex-1">
                <p className="font-semibold">Credit/Debit Card</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, Rupay</p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-300">
              <input type="radio" name="payment" className="mr-3 w-4 h-4" />
              <div className="flex-1">
                <p className="font-semibold">UPI</p>
                <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-300">
              <input type="radio" name="payment" className="mr-3 w-4 h-4" />
              <div className="flex-1">
                <p className="font-semibold">Wallet</p>
                <p className="text-sm text-gray-600">Available balance</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          🔒 Your payment is secured with 256-bit SSL encryption
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setStep(2)}
          className="border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          ← Back
        </button>
        <button
          onClick={async () => {
            try {
              setSubmitting(true);

              // Get user's coordinates if available
              let userCoordinates = [0, 0];
              if (navigator.geolocation) {
                try {
                  const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                  });
                  userCoordinates = [
                    position.coords.longitude,
                    position.coords.latitude
                  ];
                } catch (geoErr) {
                  console.log('Could not get user location:', geoErr);
                }
              }

              // Create booking payload matching backend schema
              const bookingData = {
                workerId: workerId,
                serviceType: formData.serviceType,
                description: formData.description,
                scheduledDate: formData.scheduledDate,
                scheduledTime: formData.scheduledTime,
                estimatedDuration: Number(formData.estimatedDuration),
                location: {
                  type: 'Point',
                  coordinates: userCoordinates,
                  address: formData.location.address,
                  city: formData.location.city || '',
                  state: formData.location.state || '',
                  pincode: formData.location.pincode || '',
                  landmark: formData.location.landmark || ''
                },
                totalPrice: Number(totalPrice.toFixed(2))
              };

              console.log('📤 Sending booking data:', bookingData);
              
              const result = await bookingService.createBooking(bookingData);
              
              console.log('✅ Booking created:', result);
              
              setSubmitting(false);
              
              // Show success message with wallet deduction info
              const walletDeducted = totalPrice.toFixed(2);
              const remainingBalance = ((user?.wallet || 50000) - totalPrice).toFixed(2);
              toast.success(
                `🎉 Booking created successfully! ₹${walletDeducted} deducted from wallet. Remaining balance: ₹${remainingBalance}`,
                { duration: 6000 }
              );
              
              // Redirect to user dashboard with success state
              setTimeout(() => {
                navigate('/dashboard', { 
                  state: { 
                    bookingSuccess: true,
                    bookingId: result.data?._id || result._id,
                    message: 'Your booking has been sent to the worker. You will be notified once they accept.'
                  } 
                });
              }, 1500);
            } catch (err) {
              setSubmitting(false);
              console.error('❌ Booking error:', err);
              console.error('   Response:', err.response?.data);
              toast.error(err.response?.data?.message || 'Failed to create booking. Please try again.');
            }
          }}
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {submitting ? 'Processing...' : '✓ Complete Booking'}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex-1 h-2 rounded-lg ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 h-2 rounded-lg mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 h-2 rounded-lg ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Booking Details</span>
            <span>Confirmation</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 1 && <FormStep />}
          {step === 2 && <ConfirmationStep />}
          {step === 3 && <PaymentStep />}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
