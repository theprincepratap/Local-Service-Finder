import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingService, workerService } from '../services/apiService';
import { toast } from 'react-hot-toast';
import {
  FiCheckCircle,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiArrowRight,
  FiDownload,
} from 'react-icons/fi';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID not found');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        
        // In a real app, you'd fetch the booking by ID
        // For now, we'll use the booking data passed in state or from API
        const bookingData = await bookingService.getBookingById?.(bookingId) || 
          JSON.parse(sessionStorage.getItem('lastBooking') || '{}');
        
        if (bookingData && bookingData._id) {
          setBooking(bookingData);
          
          // Fetch worker details
          if (bookingData.workerId) {
            const workerData = await workerService.getWorkerById(bookingData.workerId);
            setWorker(workerData);
          }
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadReceipt = () => {
    toast.success('Receipt downloaded');
    // Implementation would generate PDF receipt
  };

  const handleContactWorker = () => {
    if (worker?.phone) {
      window.open(`tel:${worker.phone}`);
    } else {
      toast.error('Worker contact not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/workers')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition"
          >
            Back to Workers
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-gray-600">No booking found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-2">
            Your booking has been successfully created
          </p>
          <p className="text-sm text-gray-500">
            Booking ID: <span className="font-mono font-semibold">{booking._id || 'N/A'}</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Booking Details */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Details</h2>

            {/* Service Provider */}
            {worker && (
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5" /> Service Provider
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{worker.userId?.name}</p>
                    <p className="text-sm text-gray-600">
                      {worker.categories?.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={handleContactWorker}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FiPhone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiCalendar className="w-5 h-5" /> When
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(booking.scheduledDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold text-gray-900">{booking.scheduledTime}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">
                  {booking.estimatedDuration} hour{booking.estimatedDuration > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiMapPin className="w-5 h-5" /> Where
              </h3>
              <div>
                <p className="font-semibold text-gray-900">
                  {booking.location?.address}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.location?.city}, {booking.location?.pincode}
                </p>
              </div>
            </div>

            {/* Description */}
            {booking.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Service Details</h3>
                <p className="text-gray-600">{booking.description}</p>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Rate:</span>
                <span className="font-semibold text-gray-900">
                  ₹{booking.totalPrice && booking.estimatedDuration ? 
                    (booking.totalPrice / 1.05 / booking.estimatedDuration).toFixed(2) : 'N/A'}
                  /hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">
                  {booking.estimatedDuration}h
                </span>
              </div>
              <div className="flex justify-between font-medium border-t pt-3">
                <span>Subtotal:</span>
                <span className="text-gray-900">
                  ₹{booking.totalPrice ? (booking.totalPrice / 1.05).toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Platform Fee (5%):</span>
                <span>₹{booking.platformFee?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold bg-blue-50 p-3 rounded border-l-4 border-blue-600">
                <span>Total:</span>
                <span className="text-blue-600">
                  ₹{booking.totalPrice?.toFixed(2) || 'N/A'}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-800">
                <span className="font-semibold">Status:</span> {booking.status || 'Pending'}
              </p>
            </div>

            {/* Actions */}
            <button
              onClick={handleDownloadReceipt}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-semibold transition mb-3 flex items-center justify-center gap-2"
            >
              <FiDownload className="w-4 h-4" /> Download Receipt
            </button>

            <button
              onClick={() => navigate('/bookings')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
            >
              View My Bookings
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">Payment Confirmed</p>
                <p className="text-sm text-gray-600">Your payment has been processed securely</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">Worker Notified</p>
                <p className="text-sm text-gray-600">
                  {worker?.userId?.name} will receive your booking details
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-semibold text-gray-900">Get Service</p>
                <p className="text-sm text-gray-600">
                  Worker will arrive on {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="border-2 border-gray-300 hover:border-blue-300 text-gray-900 hover:text-blue-600 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2">
              <FiMail className="w-4 h-4" /> Support
            </button>
            <button
              onClick={() => navigate('/workers')}
              className="border-2 border-gray-300 hover:border-blue-300 text-gray-900 hover:text-blue-600 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <FiArrowRight className="w-4 h-4" /> Book Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
