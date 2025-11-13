import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { workerService, reviewService } from '../services/apiService';
import { toast } from 'react-hot-toast';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiStar,
  FiCheckCircle,
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiBriefcase,
  FiUser,
} from 'react-icons/fi';

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch worker details
        if (id) {
          const workerData = await workerService.getWorkerById(id);
          console.log('Worker data:', workerData);
          setWorker(workerData);

          // Fetch worker reviews
          try {
            const reviewsData = await reviewService.getWorkerReviews(id);
            console.log('Reviews data:', reviewsData);
            setReviews(reviewsData?.data || []);
          } catch (reviewError) {
            console.log('Could not fetch reviews:', reviewError);
            setReviews([]);
          }
        }
      } catch (err) {
        console.error('Error fetching worker:', err);
        setError(err.response?.data?.message || 'Failed to load worker profile');
        toast.error('Could not load worker profile');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, [id]);

  const handleBooking = () => {
    console.log('🎯 Book Now clicked!');
    console.log('👤 User state:', user);
    console.log('📍 Worker ID:', id);
    
    if (!user) {
      console.log('❌ No user logged in, redirecting to login...');
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }
    
    const bookingUrl = `/bookings/new?workerId=${id}`;
    console.log('✅ Navigating to booking page:', bookingUrl);
    navigate(bookingUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading worker profile...</p>
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <FiArrowLeft /> Back
          </button>
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Worker not found'}</p>
            <button
              onClick={() => navigate('/workers')}
              className="text-blue-600 hover:text-blue-700"
            >
              Return to search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userInfo = worker.userId || {};
  const averageRating = worker.rating || 0;
  const totalReviews = worker.totalReviews || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

          <div className="px-6 pb-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="w-32 h-32 bg-blue-100 rounded-lg border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-16 h-16 text-blue-600" />
                </div>

                {/* Basic Info */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {userInfo.name || 'Worker'}
                    </h1>
                    {worker.verified && (
                      <FiCheckCircle className="w-6 h-6 text-green-500" title="Verified" />
                    )}
                  </div>
                  <p className="text-gray-600">{worker.categories?.join(', ') || 'Service Provider'}</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleBooking}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition w-full md:w-auto mb-2"
              >
                📅 Book Now
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Rating */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-lg">{averageRating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">({totalReviews} reviews)</p>
              </div>

              {/* Experience */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiBriefcase className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-lg">{worker.experience}</span>
                </div>
                <p className="text-sm text-gray-600">Years Experience</p>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-lg">₹{worker.pricePerHour}</span>
                </div>
                <p className="text-sm text-gray-600">Per Hour</p>
              </div>

              {/* Jobs */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <FiCalendar className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-lg">{worker.totalJobs || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Jobs Completed</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location */}
              <div className="flex items-center gap-3 text-gray-700">
                <FiMapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Service Area</p>
                  <p className="font-medium">{worker.location?.address || 'Location not specified'}</p>
                </div>
              </div>

              {/* Phone */}
              {userInfo.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FiPhone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{userInfo.phone}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {userInfo.email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <FiMail className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium truncate">{userInfo.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Skills */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {worker.bio || 'Experienced professional providing quality service. Available for bookings.'}
              </p>
            </div>

            {/* Skills */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Reviews ({totalReviews})</h2>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.userId?.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {review.createdAt && new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment || review.review}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to review this worker!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Service Details */}
          <div className="space-y-6">
            {/* Service Summary Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
              <h3 className="text-xl font-bold mb-4">Service Details</h3>

              <div className="space-y-4">
                {/* Service Radius */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service Radius</p>
                  <p className="font-semibold text-gray-900">{worker.serviceRadius} km</p>
                </div>

                {/* Availability */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Availability</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      worker.availability === 'available'
                        ? 'bg-green-100 text-green-800'
                        : worker.availability === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {worker.availability === 'available'
                      ? '✓ Available'
                      : worker.availability === 'busy'
                      ? '⏳ Busy'
                      : '✗ Offline'}
                  </span>
                </div>

                {/* Price */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hourly Rate</p>
                  <p className="text-2xl font-bold text-blue-600">₹{worker.pricePerHour}</p>
                </div>

                {/* Verified Status */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Verification</p>
                  <p className="flex items-center gap-2 font-medium">
                    {worker.verified ? (
                      <>
                        <FiCheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-600">Verified</span>
                      </>
                    ) : (
                      <>
                        <span className="w-5 h-5 rounded-full border-2 border-gray-300"></span>
                        <span className="text-gray-500">Not Verified</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Book Button (Sticky) */}
                <button
                  onClick={handleBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition mt-4"
                >
                  Book This Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
