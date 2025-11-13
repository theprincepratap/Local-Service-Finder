import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
import WorkerLocationTracker from '../components/WorkerLocationTracker';
import {
  FiUser,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiUsers,
  FiSettings,
  FiEdit,
  FiEye,
  FiMessageSquare,
  FiPhone,
  FiMail,
  FiLogOut,
  FiNavigation,
  FiX,
} from 'react-icons/fi';

const UserDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [trackingBooking, setTrackingBooking] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'worker') {
      navigate('/worker/dashboard');
      return;
    }
    fetchDashboardData();

    // Show success message if redirected from booking
    if (location.state?.bookingSuccess) {
      toast.success(
        location.state.message || '🎉 Booking created successfully! The worker will be notified.',
        { duration: 5000 }
      );
      // Clear the state to prevent message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [user, navigate, location]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats and bookings independently
      let statsData = null;
      let bookingsData = [];

      // Try to fetch stats
      try {
        const statsResponse = await apiService.user.getDashboardStats();
        statsData = statsResponse.data;
      } catch (statsError) {
        console.error('Failed to fetch stats:', statsError);
        // Don't show error toast for stats - use default values
        statsData = {
          bookings: { total: 0, active: 0, completed: 0, pending: 0 },
          spending: { total: 0, average: 0 }
        };
      }

      // Try to fetch recent bookings
      try {
        const recentBookingsResponse = await apiService.user.getRecentBookings(5);
        bookingsData = recentBookingsResponse.data || [];
      } catch (bookingsError) {
        console.error('Failed to fetch recent bookings:', bookingsError);
        // Don't show error toast for bookings - use empty array
        bookingsData = [];
      }

      setDashboardData({
        stats: statsData,
        recentBookings: bookingsData
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      // Only show error if both failed
      // Set default data to prevent crashes
      setDashboardData({
        stats: {
          bookings: { total: 0, active: 0, completed: 0, pending: 0 },
          spending: { total: 0, average: 0 }
        },
        recentBookings: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FiClock,
      confirmed: FiCheckCircle,
      'in-progress': FiTrendingUp,
      completed: FiCheckCircle,
      cancelled: FiXCircle,
    };
    const Icon = icons[status] || FiAlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const recentBookings = dashboardData?.recentBookings || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">LocalWorker</h1>
              <span className="ml-4 text-gray-500">|</span>
              <span className="ml-4 text-gray-700 font-medium">User Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiSettings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner for New Booking */}
        {location.state?.bookingSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-green-800 font-semibold mb-1">🎉 Booking Created Successfully!</h3>
                <p className="text-green-700 text-sm">
                  {location.state.message || 'Your booking has been sent to the worker. You will be notified once they accept.'}
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('pending');
                      window.history.replaceState({}, document.title);
                    }}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={() => window.history.replaceState({}, document.title)}
                    className="text-sm text-green-700 hover:text-green-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section - Compact with Key Info */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h2>
              <p className="mt-1 opacity-90 text-sm">
                {stats?.bookings?.total === 0 
                  ? "Ready to book your first service?" 
                  : `You have ${stats?.bookings?.pending || 0} pending booking${stats?.bookings?.pending !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {stats?.bookings?.total > 0 && (
                <div className="text-right bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <p className="text-xs opacity-90">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats?.bookings?.total}</p>
                </div>
              )}
              <Link
                to="/workers"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <FiUsers className="w-4 h-4" />
                Find Workers
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards - Show Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Bookings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Bookings</p>
                <h3 className="text-4xl font-bold text-gray-900">
                  {stats?.bookings?.total || 0}
                </h3>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                    ✓ {stats?.bookings?.completed || 0} done
                  </span>
                  <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                    ⏳ {stats?.bookings?.pending || 0} pending
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <FiBriefcase className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Completion Rate</p>
                <h3 className="text-4xl font-bold text-gray-900">
                  {stats?.bookings?.total > 0 
                    ? Math.round((stats?.bookings?.completed / stats?.bookings?.total) * 100) 
                    : 0}%
                </h3>
                <p className="text-sm text-green-600 mt-1 font-medium">
                  ✓ {stats?.bookings?.completed || 0} completed
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <FiTrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Active Services */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Active Services</p>
                <h3 className="text-4xl font-bold text-gray-900">
                  {stats?.bookings?.active || 0}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  In progress or pending
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <FiClock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Wallet Balance</p>
                <h3 className="text-4xl font-bold text-gray-900">
                  ₹{user?.wallet?.toLocaleString() || 50000}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Available funds
                </p>
              </div>
              <div className="bg-orange-100 p-4 rounded-lg">
                <FiDollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings with Status Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Bookings</h3>
              <Link
                to="/my-bookings"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Pending ({recentBookings.filter(b => b.status === 'pending').length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeTab === 'in-progress'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4" />
                  In Progress ({recentBookings.filter(b => b.status === 'in-progress' || b.status === 'confirmed').length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4" />
                  All Bookings ({recentBookings.length})
                </span>
              </button>
            </div>
          </div>

          {(() => {
            // Filter bookings based on active tab
            let filteredBookings = recentBookings;
            if (activeTab === 'pending') {
              filteredBookings = recentBookings.filter(b => b.status === 'pending');
            } else if (activeTab === 'in-progress') {
              filteredBookings = recentBookings.filter(b => 
                b.status === 'in-progress' || b.status === 'confirmed'
              );
            }

            return filteredBookings.length === 0 ? (
              <div className="p-8 text-center">
                <FiBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  {activeTab === 'pending' && 'No pending bookings'}
                  {activeTab === 'in-progress' && 'No bookings in progress'}
                  {activeTab === 'all' && 'No bookings yet'}
                </p>
                {activeTab === 'all' && (
                  <Link
                    to="/workers"
                    className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Book your first service →
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {booking.workerId?.userId?.profileImage ? (
                            <img
                              src={booking.workerId.userId.profileImage}
                              alt={booking.workerId.userId.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {booking.serviceType}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {booking.workerId?.userId?.name || 'Worker'}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiCalendar className="w-3 h-3" />
                              {new Date(booking.scheduledDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {booking.scheduledTime}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ₹{booking.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {booking.location?.address && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{booking.location.address}</span>
                      </div>
                    )}

                    {/* Track Worker Button for active bookings */}
                    {(booking.status === 'confirmed' || booking.status === 'on-the-way' || booking.status === 'in-progress') && (
                      <div className="mt-4">
                        <button
                          onClick={() => setTrackingBooking(booking)}
                          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                          <FiNavigation className="w-4 h-4" />
                          {booking.status === 'on-the-way' ? 'Track Worker Location' : booking.status === 'in-progress' ? 'View Job Location' : 'Worker Accepted - Track'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Quick Actions - Contextual based on bookings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Action 1: Next Booking or Find Workers */}
          {recentBookings.length > 0 && recentBookings[0]?.status !== 'completed' ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/my-bookings')}>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Upcoming</h4>
                  <p className="text-sm text-gray-600">Next: {new Date(recentBookings[0]?.scheduledDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/find-workers"
              className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 shadow-sm text-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Book Now</h4>
                  <p className="text-sm opacity-90">Find new workers</p>
                </div>
              </div>
            </Link>
          )}

          {/* Action 2: My Bookings */}
          <Link
            to="/my-bookings"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiBriefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">All Bookings</h4>
                <p className="text-sm text-gray-600">View {stats?.bookings?.total || 0} bookings</p>
              </div>
            </div>
          </Link>

          {/* Action 3: Payments & Spending */}
          <Link
            to="/my-bookings?filter=completed"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Spending</h4>
                <p className="text-sm text-gray-600">₹{stats?.spending?.total?.toLocaleString() || 0}</p>
              </div>
            </div>
          </Link>

          {/* Action 4: Settings & Profile */}
          <Link
            to="/settings"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <FiSettings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Settings</h4>
                <p className="text-sm text-gray-600">Account & preferences</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Worker Location Tracking Modal */}
      {trackingBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setTrackingBooking(null)}
            ></div>

            {/* Modal */}
            <div className="inline-block w-full max-w-4xl overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative">
              {/* Close Button */}
              <button
                onClick={() => setTrackingBooking(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>

              {/* Content */}
              <div className="p-6">
                <WorkerLocationTracker
                  bookingId={trackingBooking._id}
                  booking={trackingBooking}
                  onClose={() => setTrackingBooking(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
