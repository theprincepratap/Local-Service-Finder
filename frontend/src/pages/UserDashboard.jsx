import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/apiService';
import toast from 'react-hot-toast';
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
} from 'react-icons/fi';

const UserDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await apiService.user.getDashboardStats();
      const recentBookingsResponse = await apiService.user.getRecentBookings(5);

      setDashboardData({
        stats: statsResponse.data,
        recentBookings: recentBookingsResponse.data
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
              <p className="mt-2 opacity-90">Here's what's happening with your services</p>
            </div>
            <div className="hidden md:block">
              <Link
                to="/find-workers"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                Find Workers
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Bookings</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.bookings?.total || 0}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stats?.bookings?.active || 0} active
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiBriefcase className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Completed</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.bookings?.completed || 0}
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  ✓ Successfully done
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Pending</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.bookings?.pending || 0}
                </h3>
                <p className="text-sm text-yellow-600 mt-1">
                  ⏳ Awaiting response
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FiClock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Spent</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  ₹{stats?.spending?.total?.toLocaleString() || 0}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Avg: ₹{stats?.spending?.average?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FiDollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <Link
              to="/my-bookings"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-8 text-center">
              <FiBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
              <Link
                to="/find-workers"
                className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Book your first service →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/find-workers"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <FiUsers className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Find Workers</h4>
                <p className="text-sm text-gray-600">Browse available services</p>
              </div>
            </div>
          </Link>

          <Link
            to="/my-bookings"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiBriefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">My Bookings</h4>
                <p className="text-sm text-gray-600">View all bookings</p>
              </div>
            </div>
          </Link>

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
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
