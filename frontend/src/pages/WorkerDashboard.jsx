import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import {
  FiHome,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiStar,
  FiUser,
  FiSettings,
  FiCalendar,
  FiFileText,
  FiBell,
  FiMenu,
  FiX,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiEdit,
  FiLogOut,
  FiLoader,
  FiNavigation,
} from 'react-icons/fi';

// Import Dashboard Sections
import EarningsSection from '../components/dashboard/EarningsSection';
import ReviewsSection from '../components/dashboard/ReviewsSection';
import AvailabilitySection from '../components/dashboard/AvailabilitySection';

// Import Dashboard Service for Real Data
import workerDashboardService from '../services/workerDashboardService';

// Debug component (REMOVE AFTER FIXING AUTH)
import AuthDebug from '../components/AuthDebug';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Check if user is actually a worker
  useEffect(() => {
    // If not authenticated or not a worker, redirect to login/dashboard
    if (!isAuthenticated || !user || user.role !== 'worker') {
      if (!isAuthenticated) {
        console.log('🔐 Not authenticated, redirecting to login');
        navigate('/login', { replace: true });
      } else {
        console.log('🚫 Not a worker, redirecting to dashboard');
        toast.error('Access denied. Worker account required.');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading while authentication is being checked
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-primary-600 mx-auto mb-2" size={32} />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'worker') {
    return null;
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    { id: 'jobs', label: 'Active Jobs', icon: FiBriefcase },
    { id: 'history', label: 'Job History', icon: FiClock },
    { id: 'earnings', label: 'Earnings', icon: FiDollarSign },
    { id: 'reviews', label: 'Reviews', icon: FiStar },
    { id: 'availability', label: 'Availability', icon: FiCalendar },
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'documents', label: 'Documents', icon: FiFileText },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-primary-600">Worker Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg relative"
              >
                <FiBell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">New job request</p>
                      <p className="text-xs text-gray-600">5 minutes ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static lg:translate-x-0 left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-20 overflow-y-auto`}
        >
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 max-w-7xl">
          {activeTab === 'overview' && <OverviewSection user={user} token={token} />}
          {activeTab === 'jobs' && <ActiveJobsSection user={user} />}
          {activeTab === 'history' && <JobHistorySection user={user} />}
          {activeTab === 'earnings' && <EarningsSection />}
          {activeTab === 'reviews' && <ReviewsSection />}
          {activeTab === 'availability' && <AvailabilitySection />}
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'documents' && <DocumentsSection />}
          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

// ============================================
// PENDING REQUESTS CARD COMPONENT
// ============================================
const PendingRequestsCard = ({ pendingRequests, onRefresh }) => {
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async (requestId) => {
    try {
      setProcessingId(requestId);
      console.log('✅ Accepting request:', requestId);
      
      const { bookingService } = await import('../services/apiService');
      await bookingService.updateBookingStatus(requestId, 'confirmed');
      
      toast.success('Request accepted!');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setProcessingId(requestId);
      console.log('❌ Declining request:', requestId);
      
      const { bookingService } = await import('../services/apiService');
      await bookingService.updateBookingStatus(requestId, 'cancelled', 'Worker declined');
      
      toast.success('Request declined');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error(error.response?.data?.message || 'Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Pending Requests ({pendingRequests.length})
      </h3>
      {pendingRequests.length > 0 ? (
        <div className="space-y-3">
          {pendingRequests.slice(0, 3).map((req) => (
            <div key={req._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{req.serviceType || 'Service Request'}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Client: {req.userId?.name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Location: {req.location?.address || req.location?.city || 'Not specified'}
                  </p>
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    ₹{req.totalPrice || 0}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => handleAccept(req._id)}
                  disabled={processingId === req._id}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {processingId === req._id ? 'Processing...' : 'Accept'}
                </button>
                <button 
                  onClick={() => handleDecline(req._id)}
                  disabled={processingId === req._id}
                  className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                >
                  {processingId === req._id ? 'Processing...' : 'Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiAlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-600">No pending requests</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// OVERVIEW SECTION - REAL DATA FROM API
// ============================================
const OverviewSection = ({ user, token }) => {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // AGGRESSIVE DEBUG: Verify token is in storage RIGHT before API call
      const tokenCheck = localStorage.getItem('token');
      console.log('🔑 [BEFORE API CALL] Token in localStorage:', {
        exists: !!tokenCheck,
        length: tokenCheck?.length || 0,
        first30: tokenCheck ? tokenCheck.substring(0, 30) + '...' : 'NULL',
        timestamp: new Date().toISOString()
      });
      
      console.log('📊 Fetching dashboard data with token present');
      
      // Fetch with error handling for each request
      let statsData = { data: {} };
      let pendingData = { data: { requests: [] } };
      let scheduleData = { data: { schedule: [] } };
      let hasError = false;

      try {
        statsData = await workerDashboardService.getDashboardStats();
        console.log('✅ Got stats:', statsData);
      } catch (err) {
        console.error('❌ Stats API error:', err.response?.status, err.message);
        hasError = true;
      }

      try {
        pendingData = await workerDashboardService.getPendingRequests();
        console.log('✅ Got pending requests:', pendingData);
      } catch (err) {
        console.error('❌ Pending requests API error:', err.response?.status, err.message);
      }

      try {
        scheduleData = await workerDashboardService.getTodaySchedule();
        console.log('✅ Got schedule:', scheduleData);
      } catch (err) {
        console.error('❌ Schedule API error:', err.response?.status, err.message);
      }

      if (hasError) {
        const errorMsg = 'Failed to load dashboard stats. Please check your connection and try again.';
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      setStats(statsData.data || {});
      setPendingRequests(pendingData.data?.requests || []);
      setTodaySchedule(scheduleData.data?.schedule || []);
      setLoading(false);
    } catch (error) {
      console.error('❌ Unexpected error fetching dashboard data:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for user to be set and token to be available
    if (!user || user.role !== 'worker') {
      return;
    }

    // Check that token exists (from Zustand store or localStorage)
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      console.warn('⚠️ OverviewSection: User is set but token not available yet');
      setLoading(false);
      return;
    }

    console.log('✅ OverviewSection: User and token are ready, fetching dashboard data');
    fetchDashboardData();
  }, [user, token, fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiLoader className="animate-spin text-primary-600 mx-auto mb-2" size={32} />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiAlertCircle className="text-red-500 mx-auto mb-2" size={32} />
          <p className="text-red-600 font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchDashboardData();
            }}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsArray = [
    {
      label: 'Total Earnings',
      value: `₹${stats?.totalEarnings || 0}`,
      change: `+${stats?.monthEarnings || 0} this month`,
      icon: FiDollarSign,
      color: 'green',
    },
    {
      label: 'Active Jobs',
      value: stats?.activeJobs || '0',
      change: stats?.activeJobs > 0 ? `${stats?.activeJobs} in progress` : 'No active jobs',
      icon: FiBriefcase,
      color: 'blue',
    },
    {
      label: 'Completed Jobs',
      value: stats?.completedJobs || '0',
      change: `${stats?.completedJobs || 0} total completed`,
      icon: FiCheckCircle,
      color: 'purple',
    },
    {
      label: 'Average Rating',
      value: (stats?.averageRating || 0).toFixed(1),
      change: `⭐ ${(stats?.averageRating || 0).toFixed(1)}`,
      icon: FiStar,
      color: 'yellow',
    },
  ];

  return (
    <div className="space-y-6">
      {/* DEBUG TOGGLE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {showDebug ? '🔍 Hide Debug' : '🔍 Show Debug'}
        </button>
      </div>

      {/* DEBUG COMPONENT - Collapsible */}
      {showDebug && (
        <div className="animate-in slide-in-from-top">
          <AuthDebug />
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArray.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm mt-2 text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests - REAL DATA */}
        <PendingRequestsCard 
          pendingRequests={pendingRequests} 
          onRefresh={fetchDashboardData}
        />

        {/* Today's Schedule - REAL DATA */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Schedule ({todaySchedule.length})
          </h3>
          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((job) => (
                <div
                  key={job._id}
                  className="flex gap-4 p-3 border-l-4 border-green-500 bg-green-50 rounded"
                >
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(job.scheduledTime).getHours()}:00
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(job.scheduledTime).getHours() >= 12 ? 'PM' : 'AM'}
                    </p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.serviceCategory}</h4>
                    <p className="text-sm text-gray-600">Client: {job.userId?.name}</p>
                    <p className="text-sm text-gray-600">{job.location?.city}</p>
                  </div>
                  <button className="px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 h-fit">
                    Start
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">No scheduled jobs for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Earnings Trend Chart - REAL DATA */}
      {stats?.earningsTrend && stats.earningsTrend.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Trend (30 Days)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.earningsTrend.map((item, i) => {
              const maxEarning = Math.max(...stats.earningsTrend.map((e) => e.earnings));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary-500 rounded-t hover:bg-primary-600 cursor-pointer transition-colors"
                    style={{
                      height:
                        maxEarning > 0 ? `${(item.earnings / maxEarning) * 100}%` : '4px',
                      minHeight: '4px',
                    }}
                    title={`₹${item.earnings} on ${item.date}`}
                  ></div>
                  <span className="text-xs text-gray-600">{new Date(item.date).getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// ACTIVE JOBS SECTION - REAL DATA FROM API
// ============================================
const ActiveJobsSection = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingJobId, setProcessingJobId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching active jobs with token present');
      const response = await workerDashboardService.getActiveJobs(currentPage, 10);
      setJobs(response.data?.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when user is authenticated
    if (!user || user.role !== 'worker') {
      setLoading(false);
      return;
    }

    // IMPORTANT: Also check that token exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ ActiveJobsSection: User is set but token not in localStorage yet');
      return;
    }

    fetchJobs();
  }, [user, currentPage]);

  // Handle Accept Job
  const handleAcceptJob = async (jobId) => {
    try {
      setProcessingJobId(jobId);
      console.log('✅ Accepting job:', jobId);
      
      // Import bookingService dynamically
      const { bookingService } = await import('../services/apiService');
      await bookingService.updateBookingStatus(jobId, 'confirmed');
      
      toast.success('Job accepted successfully!');
      
      // Refresh jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error accepting job:', error);
      toast.error(error.response?.data?.message || 'Failed to accept job');
    } finally {
      setProcessingJobId(null);
    }
  };

  // Handle Decline Job
  const handleDeclineJob = async (jobId) => {
    try {
      setProcessingJobId(jobId);
      console.log('❌ Declining job:', jobId);
      
      // Import bookingService dynamically
      const { bookingService } = await import('../services/apiService');
      await bookingService.updateBookingStatus(jobId, 'cancelled', 'Worker declined the request');
      
      toast.success('Job declined');
      
      // Refresh jobs list
      fetchJobs();
    } catch (error) {
      console.error('Error declining job:', error);
      toast.error(error.response?.data?.message || 'Failed to decline job');
    } finally {
      setProcessingJobId(null);
    }
  };

  // Handle Start Job
  const handleStartJob = async (jobId) => {
    try {
      setProcessingJobId(jobId);
      console.log('🚀 Starting job:', jobId);
      
      const { bookingService } = await import('../services/apiService');
      await bookingService.updateBookingStatus(jobId, 'in-progress');
      
      toast.success('Job started!');
      fetchJobs();
    } catch (error) {
      console.error('Error starting job:', error);
      toast.error(error.response?.data?.message || 'Failed to start job');
    } finally {
      setProcessingJobId(null);
    }
  };

  // Handle Start Journey (on-the-way)
  const handleStartJourney = async (jobId) => {
    try {
      setProcessingJobId(jobId);
      console.log('🚗 Starting journey to customer:', jobId);
      
      const { bookingService } = await import('../services/apiService');
      await bookingService.updateBookingStatus(jobId, 'on-the-way');
      
      // Start location tracking
      startLocationTracking(jobId);
      
      toast.success('🚗 Journey started! Location tracking enabled.');
      fetchJobs();
    } catch (error) {
      console.error('Error starting journey:', error);
      toast.error(error.response?.data?.message || 'Failed to start journey');
    } finally {
      setProcessingJobId(null);
    }
  };

  // Start real-time location tracking
  const startLocationTracking = (jobId) => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const { bookingService } = await import('../services/apiService');
            await bookingService.updateWorkerLocation(jobId, latitude, longitude);
            console.log('📍 Location updated:', latitude, longitude);
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to access your location');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
      
      // Store watch ID to stop tracking later
      localStorage.setItem(`tracking_${jobId}`, watchId);
    } else {
      toast.error('Geolocation not supported by your browser');
    }
  };

  // Handle Complete Job
  const handleCompleteJob = async (jobId) => {
    try {
      setProcessingJobId(jobId);
      console.log('✅ Completing job:', jobId);
      
      const { bookingService } = await import('../services/apiService');
      await bookingService.updateBookingStatus(jobId, 'completed');
      
      toast.success('Job completed!');
      fetchJobs();
    } catch (error) {
      console.error('Error completing job:', error);
      toast.error(error.response?.data?.message || 'Failed to complete job');
    } finally {
      setProcessingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch =
      job.serviceCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Accepted' },
      'in-progress': { bg: 'bg-green-100', text: 'text-green-800', label: 'In Progress' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
    };
    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiLoader className="animate-spin text-primary-600 mx-auto mb-2" size={32} />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
          <p className="text-gray-600 mt-1">Manage your ongoing and pending jobs</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {jobs.filter((j) => j.status === 'pending').length} Pending
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {jobs.filter((j) => j.status === 'in-progress').length} Active
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'accepted', 'in-progress'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List - REAL DATA */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.serviceCategory}</h3>
                      {job.description && (
                        <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                      )}
                    </div>
                    {getStatusBadge(job.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Client</p>
                      <p className="text-gray-900 font-semibold">{job.userId?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Location</p>
                      <p className="text-gray-900">{job.location?.city}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Date</p>
                      <p className="text-gray-900">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Price</p>
                      <p className="text-primary-600 font-bold">₹{job.priceQuoted}</p>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2 justify-center lg:w-40">
                  {job.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAcceptJob(job._id)}
                        disabled={processingJobId === job._id}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {processingJobId === job._id ? 'Processing...' : 'Accept'}
                      </button>
                      <button 
                        onClick={() => handleDeclineJob(job._id)}
                        disabled={processingJobId === job._id}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                      >
                        {processingJobId === job._id ? 'Processing...' : 'Decline'}
                      </button>
                    </>
                  )}
                  {(job.status === 'confirmed' || job.status === 'accepted') && (
                    <button 
                      onClick={() => handleStartJourney(job._id)}
                      disabled={processingJobId === job._id}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full transition flex items-center justify-center gap-2"
                    >
                      {processingJobId === job._id ? 'Starting...' : (
                        <>
                          <FiNavigation className="w-4 h-4" />
                          Start Journey
                        </>
                      )}
                    </button>
                  )}
                  {job.status === 'on-the-way' && (
                    <button 
                      onClick={() => handleStartJob(job._id)}
                      disabled={processingJobId === job._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full transition flex items-center justify-center gap-2"
                    >
                      {processingJobId === job._id ? 'Starting...' : (
                        <>
                          <FiCheckCircle className="w-4 h-4" />
                          Arrive & Start
                        </>
                      )}
                    </button>
                  )}
                  {job.status === 'in-progress' && (
                    <button 
                      onClick={() => handleCompleteJob(job._id)}
                      disabled={processingJobId === job._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full transition"
                    >
                      {processingJobId === job._id ? 'Completing...' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiAlertCircle className="mx-auto text-gray-400 mb-2" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mt-4">No jobs found</h3>
            <p className="text-gray-600 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// JOB HISTORY SECTION - REAL DATA FROM API
// ============================================
const JobHistorySection = ({ user }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch when user is authenticated
    if (!user || user.role !== 'worker') {
      setLoading(false);
      return;
    }

    // IMPORTANT: Also check that token exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ JobHistorySection: User is set but token not in localStorage yet');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        console.log('📜 Fetching job history with token present');
        const response = await workerDashboardService.getJobHistory(currentPage, 10, filterStatus);
        setHistory(response.data?.bookings || []);
      } catch (error) {
        console.error('Error fetching job history:', error);
        toast.error('Failed to load job history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, currentPage, filterStatus]);

  const totalEarnings = history
    .filter((j) => j.status === 'completed')
    .reduce((sum, j) => sum + (j.workerEarning || 0), 0);
  const completedCount = history.filter((j) => j.status === 'completed').length;
  const avgRating =
    history.filter((j) => j.rating).length > 0
      ? (
          history.filter((j) => j.rating).reduce((sum, j) => sum + j.rating, 0) /
          history.filter((j) => j.rating).length
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FiLoader className="animate-spin text-primary-600 mx-auto mb-2" size={32} />
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job History</h2>
          <p className="text-gray-600 mt-1">View all your past jobs and earnings</p>
        </div>
      </div>

      {/* Summary Cards - REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
          <p className="text-sm text-green-700">Total Jobs Completed</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{completedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
          <p className="text-sm text-blue-700">Total Earnings</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">₹{totalEarnings}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-6">
          <p className="text-sm text-yellow-700">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2 flex items-center gap-1">
            {avgRating}
            <FiStar className="text-2xl" fill="currentColor" />
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table - REAL DATA */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Service</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Client</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Location</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((job, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{job.serviceCategory}</td>
                    <td className="px-4 py-3">{job.userId?.name || 'Anonymous'}</td>
                    <td className="px-4 py-3">{job.location?.city || 'N/A'}</td>
                    <td className="px-4 py-3 text-primary-600 font-bold">₹{job.workerEarning || 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {job.rating ? (
                        <div className="flex items-center gap-1">
                          {job.rating}
                          <FiStar size={14} fill="currentColor" className="text-yellow-500" />
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiAlertCircle className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-600">No job history</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Placeholder components
const ProfileSection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <button
            onClick={() => navigate('/worker/profile/edit')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiEdit className="mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiUser className="text-blue-600 text-3xl" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-gray-600">{user?.role === 'worker' ? 'Service Provider' : 'User'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <FiMail className="mr-3 text-gray-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <FiPhone className="mr-3 text-gray-400" />
                <span>{user?.phone}</span>
              </div>
              {user?.location?.address && (
                <div className="flex items-center text-gray-700">
                  <FiMapPin className="mr-3 text-gray-400" />
                  <span className="text-sm">{user.location.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Member Since</span>
              <span className="text-gray-900 font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profile Complete</span>
              <span className="text-gray-900 font-medium">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/worker/profile/edit')}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiEdit className="text-blue-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-900">Edit Profile</h3>
          <p className="text-sm text-gray-600 mt-1">Update your information</p>
        </button>

        <button
          onClick={() => navigate('/worker/profile/edit')}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiFileText className="text-green-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-600 mt-1">Upload verification docs</p>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiSettings className="text-purple-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-900">Settings</h3>
          <p className="text-sm text-gray-600 mt-1">Manage preferences</p>
        </button>
      </div>

      {/* Profile Completion Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <FiAlertCircle className="mr-2 text-blue-600" />
          Complete Your Profile
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center">
            <FiCheckCircle className="mr-2 text-green-600" />
            Add a professional photo
          </li>
          <li className="flex items-center">
            <FiCheckCircle className="mr-2 text-green-600" />
            Upload verification documents
          </li>
          <li className="flex items-center">
            <FiCheckCircle className="mr-2 text-green-600" />
            Set your service categories and skills
          </li>
          <li className="flex items-center">
            <FiCheckCircle className="mr-2 text-green-600" />
            Add your working hours and availability
          </li>
        </ul>
      </div>
    </div>
  );
};

const DocumentsSection = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
    <p className="text-gray-600 mt-2">Building in progress...</p>
  </div>
);

const SettingsSection = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
    <p className="text-gray-600 mt-2">Building in progress...</p>
  </div>
);

export default WorkerDashboard;
