import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';
import {
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiEye,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiLock,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    approvalStatus: 'all',
  });
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Auth check effect - Check if user is admin
  useEffect(() => {
    console.log('=== ADMIN DASHBOARD MOUNTED ===');
    console.log('user:', user);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user role:', user?.role);
    
    // If user data is still loading, wait (Zustand rehydration)
    if (!user && isAuthenticated === false) {
      // Wait a moment for state to load
      return;
    }
    
    // If not authenticated, just show loading state
    if (!isAuthenticated && user === null) {
      console.log('Not authenticated - showing not authenticated page');
      return;
    }
    
    // If user data loaded and not authenticated, show not authenticated page
    if (!isAuthenticated && user) {
      console.log('Not authenticated but user data exists');
      return;
    }
    
    // If user is not admin, show access denied page
    if (user && user.role !== 'admin') {
      console.log('Access denied - user is not admin');
      return;
    }
    
    // User is authenticated admin, load dashboard data
    if (user && user.role === 'admin') {
      console.log('Admin authenticated, loading dashboard data');
      loadDashboardData();
    }
  }, [user, isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getDashboardStats();
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Load dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllWorkers(filters);
      setWorkers(response.data.workers);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load workers error:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllUsers(filters);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllBookings(filters);
      setBookings(response.data.bookings);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load bookings error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllReviews(filters);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load reviews error:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'workers') loadWorkers();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'bookings') loadBookings();
    else if (activeTab === 'reviews') loadReviews();
  }, [activeTab, filters]);

  const handleApproveWorker = async (workerId) => {
    if (!confirm('Are you sure you want to approve this worker?')) return;

    try {
      await apiService.admin.approveWorker(workerId, 'Your application has been approved!');
      toast.success('Worker approved successfully');
      loadWorkers();
      loadDashboardData();
    } catch (error) {
      console.error('Approve worker error:', error);
      toast.error('Failed to approve worker');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await apiService.admin.rejectWorker(workerId, reason);
      toast.success('Worker rejected');
      loadWorkers();
      loadDashboardData();
    } catch (error) {
      console.error('Reject worker error:', error);
      toast.error('Failed to reject worker');
    }
  };

  const handleViewWorker = (worker) => {
    setSelectedWorker(worker);
  };

  const handleCloseWorkerModal = () => {
    setSelectedWorker(null);
  };

  const handleToggleUserStatus = async (userId) => {
    if (!confirm('Are you sure you want to toggle this user status?')) return;

    try {
      await apiService.admin.toggleUserStatus(userId);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      console.error('Toggle user status error:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await apiService.admin.deleteUser(userId);
      toast.success('User deleted');
      loadUsers();
      loadDashboardData();
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const reason = prompt('Please provide a reason for deleting this review:');
    if (!reason) return;

    try {
      await apiService.admin.deleteReview(reviewId, reason);
      toast.success('Review deleted');
      loadReviews();
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error('Failed to delete review');
    }
  };

  // Show loading while dashboard data is being loaded
  if (loading && !dashboardStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h1>
          <p className="text-gray-600 mb-6">Please login to access the admin dashboard</p>
          <Link
            to="/admin/login"
            className="btn btn-primary"
          >
            Go to Admin Login
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Regular user? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Login here</Link>
          </p>
        </div>
      </div>
    );
  }

  // Check if user is not admin
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <FiLock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have admin privileges to access this area</p>
          <Link
            to="/"
            className="btn btn-primary"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setToken(null);
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage users, workers, and system operations</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right mr-2">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={loadDashboardData}
                className="btn btn-outline flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-danger flex items-center gap-2"
              >
                <FiLock className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {activeTab === 'overview' && dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FiUsers className="w-8 h-8 text-blue-600" />}
              title="Total Users"
              value={dashboardStats.totalUsers}
              subtitle={`${dashboardStats.userGrowth}% growth this week`}
              bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
            />
            <StatCard
              icon={<FiBriefcase className="w-8 h-8 text-primary-600" />}
              title="Total Workers"
              value={dashboardStats.totalWorkers}
              subtitle={`${dashboardStats.pendingApprovals} pending approval`}
              bgColor="bg-gradient-to-br from-primary-50 to-primary-100"
              alert={dashboardStats.pendingApprovals > 0}
            />
            <StatCard
              icon={<FiCalendar className="w-8 h-8 text-green-600" />}
              title="Total Bookings"
              value={dashboardStats.totalBookings}
              subtitle={`${dashboardStats.activeBookings} active`}
              bgColor="bg-gradient-to-br from-green-50 to-green-100"
            />
            <StatCard
              icon={<FiDollarSign className="w-8 h-8 text-yellow-600" />}
              title="Total Revenue"
              value={`₹${dashboardStats.totalRevenue.toLocaleString()}`}
              subtitle={`Avg: ₹${Math.round(dashboardStats.averageRevenue)}`}
              bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
            />
          </div>
        )}

        {/* Pending Workers Alert */}
        {activeTab === 'overview' && dashboardStats?.pendingApprovals > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have <span className="font-semibold">{dashboardStats.pendingApprovals}</span> worker(s) 
                  waiting for approval.{' '}
                  <button 
                    onClick={() => setActiveTab('workers')}
                    className="font-medium underline hover:text-yellow-800"
                  >
                    Review now
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              <TabButton
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                icon={<FiTrendingUp />}
                label="Overview"
              />
              <TabButton
                active={activeTab === 'workers'}
                onClick={() => setActiveTab('workers')}
                icon={<FiBriefcase />}
                label={`Workers ${dashboardStats?.pendingApprovals > 0 ? `(${dashboardStats.pendingApprovals})` : ''}`}
                alert={dashboardStats?.pendingApprovals > 0}
              />
              <TabButton
                active={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
                icon={<FiUsers />}
                label="Users"
              />
              <TabButton
                active={activeTab === 'bookings'}
                onClick={() => setActiveTab('bookings')}
                icon={<FiCalendar />}
                label="Bookings"
              />
              <TabButton
                active={activeTab === 'reviews'}
                onClick={() => setActiveTab('reviews')}
                icon={<FiStar />}
                label="Reviews"
              />
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab stats={dashboardStats} />}
            {activeTab === 'workers' && (
              <WorkersTab
                workers={workers}
                loading={loading}
                filters={filters}
                setFilters={setFilters}
                pagination={pagination}
                onApprove={handleApproveWorker}
                onReject={handleRejectWorker}
                onView={handleViewWorker}
              />
            )}
            {activeTab === 'users' && (
              <UsersTab
                users={users}
                loading={loading}
                filters={filters}
                setFilters={setFilters}
                pagination={pagination}
                onToggleStatus={handleToggleUserStatus}
                onDelete={handleDeleteUser}
              />
            )}
            {activeTab === 'bookings' && (
              <BookingsTab
                bookings={bookings}
                loading={loading}
                filters={filters}
                setFilters={setFilters}
                pagination={pagination}
              />
            )}
            {activeTab === 'reviews' && (
              <ReviewsTab
                reviews={reviews}
                loading={loading}
                filters={filters}
                setFilters={setFilters}
                pagination={pagination}
                onDelete={handleDeleteReview}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    {selectedWorker && (
      <WorkerDetailsModal worker={selectedWorker} onClose={handleCloseWorkerModal} />
    )}
    </>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, bgColor, alert }) => (
  <div className={`${bgColor} rounded-xl p-6 border ${alert ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white rounded-lg shadow-sm">
        {icon}
      </div>
      {alert && <FiAlertCircle className="w-5 h-5 text-yellow-600 animate-pulse" />}
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);

// Tab Button Component
const TabButton = ({ active, onClick, icon, label, alert }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
      active
        ? 'border-primary-600 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {icon}
    {label}
    {alert && <span className="ml-1 bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full">!</span>}
  </button>
);

// Overview Tab
const OverviewTab = ({ stats }) => {
  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-200">
          <h4 className="font-semibold text-gray-900 mb-4">Worker Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approved</span>
              <span className="font-semibold text-green-600">{stats.activeWorkers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.pendingApprovals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Workers</span>
              <span className="font-semibold text-gray-900">{stats.totalWorkers}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-4">Booking Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active</span>
              <span className="font-semibold text-blue-600">{stats.activeBookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Today</span>
              <span className="font-semibold text-green-600">{stats.completedToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">{stats.totalBookings}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
          <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Reviews</span>
              <span className="font-semibold text-blue-600">+{stats.newReviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Rating</span>
              <span className="font-semibold text-primary-600">{stats.averageRating}/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Reviews</span>
              <span className="font-semibold text-gray-900">{stats.totalReviews}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Workers Tab
const WorkersTab = ({ workers, loading, filters, setFilters, pagination, onApprove, onReject, onView }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900">Worker Management</h3>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search workers..."
          className="input"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select
          className="input"
          value={filters.approvalStatus}
          onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value, page: 1 })}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    {loading ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    ) : workers.length === 0 ? (
      <div className="text-center py-8 text-gray-500">No workers found</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers.map((worker) => (
              <tr key={worker._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{worker.userId?.name}</div>
                    <div className="text-sm text-gray-500">{worker.userId?.email}</div>
                    <div className="text-sm text-gray-500">{worker.userId?.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {worker.categories?.map((cat, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{worker.experience} years</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      worker.approvalStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : worker.approvalStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {worker.approvalStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    <div>Jobs: {worker.stats?.jobCount || 0}</div>
                    <div>Rating: {worker.stats?.averageRating?.toFixed(1) || 0}/5</div>
                    <div>Earned: ₹{worker.stats?.totalEarnings || 0}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {worker.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(worker._id)}
                          className="text-green-600 hover:text-green-700"
                          title="Approve"
                        >
                          <FiUserCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onReject(worker._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Reject"
                        >
                          <FiUserX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onView?.(worker)}
                      className="text-blue-600 hover:text-blue-700"
                      title="View Details"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Pagination */}
    {pagination.pages > 1 && (
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          disabled={filters.page === 1}
          className="btn btn-outline disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          disabled={filters.page === pagination.pages}
          className="btn btn-outline disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

const WorkerDetailsModal = ({ worker, onClose }) => {
  if (!worker) return null;

  const user = worker.userId || {};
  const documents = worker.documents || {};
  const workingHours = worker.workingHours || {};
  const initials = user.name
    ? user.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'NA';

  const renderDocumentLink = (label, url) => {
    if (!url) return (
      <div className="flex justify-between text-sm text-gray-500">
        <span className="font-medium text-gray-600">{label}</span>
        <span>Not uploaded</span>
      </div>
    );

    return (
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-600">{label}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Document
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Worker Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close worker details"
          >
            <FiXCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name || 'Worker profile'}
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-semibold">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user.name || 'Unknown Worker'}</h3>
              <p className="text-sm text-gray-600">{user.email || 'No email provided'}</p>
              <p className="text-sm text-gray-600">{user.phone || 'No phone number'}</p>
            </div>
          </div>

          {worker.bio && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{worker.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Professional Details</h4>
              <p className="text-sm text-gray-600">Experience: {worker.experience || 0} years</p>
              <p className="text-sm text-gray-600">Price / Hour: ₹{worker.pricePerHour || 0}</p>
              <p className="text-sm text-gray-600">Radius: {worker.serviceRadius || 0} km</p>
              <p className="text-sm text-gray-600">Rating: {worker.rating?.toFixed?.(1) || 0} / 5</p>
              <p className="text-sm text-gray-600">Total Reviews: {worker.totalReviews || 0}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {worker.categories?.length ? (
                  worker.categories.map((cat, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No categories listed</span>
                )}
              </div>

              {worker.skills?.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mt-4">Skills</h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {worker.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Working Hours</h4>
              {Object.keys(workingHours).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(workingHours).map(([day, value]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{day}</span>
                      {value?.isAvailable ? (
                        <span className="text-gray-800">
                          {value.start || '--'} - {value.end || '--'}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Available</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Working hours not provided</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">Documents</h4>
              <div className="space-y-2">
                {renderDocumentLink('ID Proof', documents.idProof)}
                {renderDocumentLink('Address Proof', documents.addressProof)}
                {renderDocumentLink('Certificate', documents.certificate)}
              </div>
            </div>
          </div>

          {worker.location?.coordinates && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Location</h4>
              <p className="text-sm text-gray-600">
                Latitude: {worker.location.coordinates[1]?.toFixed?.(4) || 'N/A'}, Longitude: {worker.location.coordinates[0]?.toFixed?.(4) || 'N/A'}
              </p>
              {worker.location?.address && (
                <p className="text-sm text-gray-600 mt-1">{worker.location.address}</p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab
const UsersTab = ({ users, loading, filters, setFilters, pagination, onToggleStatus, onDelete }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search users..."
          className="input"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select
          className="input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    {loading ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    ) : users.length === 0 ? (
      <div className="text-center py-8 text-gray-500">No users found</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-sm text-gray-600">{user.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    <div>Bookings: {user.stats?.bookingCount || 0}</div>
                    <div>Spent: ₹{user.stats?.totalSpent || 0}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggleStatus(user._id)}
                      className="text-blue-600 hover:text-blue-700"
                      title={user.isActive ? 'Suspend' : 'Activate'}
                    >
                      {user.isActive ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => onDelete(user._id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Pagination */}
    {pagination.pages > 1 && (
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          disabled={filters.page === 1}
          className="btn btn-outline disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          disabled={filters.page === pagination.pages}
          className="btn btn-outline disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

// Bookings Tab
const BookingsTab = ({ bookings, loading, filters, setFilters, pagination }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900">Booking Management</h3>
      <select
        className="input"
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    {loading ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    ) : bookings.length === 0 ? (
      <div className="text-center py-8 text-gray-500">No bookings found</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">#{booking._id.slice(-6)}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{booking.serviceType}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{booking.userId?.name}</div>
                  <div className="text-xs text-gray-500">{booking.userId?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{booking.workerId?.name}</div>
                  <div className="text-xs text-gray-500">{booking.workerId?.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">₹{booking.totalAmount}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* Pagination */}
    {pagination.pages > 1 && (
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          disabled={filters.page === 1}
          className="btn btn-outline disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          disabled={filters.page === pagination.pages}
          className="btn btn-outline disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

// Reviews Tab
const ReviewsTab = ({ reviews, loading, filters, setFilters, pagination, onDelete }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900">Review Management</h3>
      <select
        className="input"
        value={filters.minRating || 0}
        onChange={(e) => setFilters({ ...filters, minRating: e.target.value, page: 1 })}
      >
        <option value="0">All Ratings</option>
        <option value="1">1+ Stars</option>
        <option value="2">2+ Stars</option>
        <option value="3">3+ Stars</option>
        <option value="4">4+ Stars</option>
        <option value="5">5 Stars</option>
      </select>
    </div>

    {loading ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    ) : reviews.length === 0 ? (
      <div className="text-center py-8 text-gray-500">No reviews found</div>
    ) : (
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium text-gray-900">{review.userId?.name}</div>
                  <div className="flex items-center text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Worker: {review.workerId?.name} • {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => onDelete(review._id)}
                className="text-red-600 hover:text-red-700"
                title="Delete"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-700">{review.comment}</p>
            {review.workerResponse && (
              <div className="mt-3 pl-4 border-l-2 border-primary-200">
                <div className="text-sm text-gray-600 mb-1">Worker Response:</div>
                <p className="text-gray-700">{review.workerResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Pagination */}
    {pagination.pages > 1 && (
      <div className="flex justify-center gap-2 mt-4">
        <button
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          disabled={filters.page === 1}
          className="btn btn-outline disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          disabled={filters.page === pagination.pages}
          className="btn btn-outline disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
);

export default AdminDashboard;
