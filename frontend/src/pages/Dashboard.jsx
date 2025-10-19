// This file is kept for backward compatibility
// Redirect to the appropriate dashboard based on user role
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UserDashboard from './UserDashboard';
import WorkerDashboard from './WorkerDashboard';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Show loading while checking user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  if (user.role === 'worker') {
    return <WorkerDashboard />;
  }

  return <UserDashboard />;
};

export default Dashboard;
            rating: 5,
          },
          {
            _id: '2',
            serviceType: 'Electrician',
            workerName: 'Jane Smith',
            status: 'in-progress',
            date: '2025-10-17',
            amount: 800,
          },
          {
            _id: '3',
            serviceType: 'Cleaner',
            workerName: 'Mike Johnson',
            status: 'pending',
            date: '2025-10-20',
            amount: 300,
          },
        ],
        workerStats: user?.role === 'worker' ? {
          totalJobs: 45,
          activeJobs: 5,
          completedJobs: 38,
          totalEarnings: 45000,
          averageRating: 4.7,
          totalReviews: 32,
          responseRate: 95,
          completionRate: 98,
        } : null,
      };

      setDashboardData(mockData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiAlertCircle className="w-4 h-4" />,
      'in-progress': <FiClock className="w-4 h-4" />,
      completed: <FiCheckCircle className="w-4 h-4" />,
      cancelled: <FiXCircle className="w-4 h-4" />,
    };
    return icons[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'worker' 
                  ? 'Manage your jobs and track your earnings'
                  : 'Track your bookings and find local workers'}
              </p>
            </div>
            <Link
              to="/settings"
              className="btn btn-outline flex items-center gap-2"
            >
              <FiSettings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'worker' ? (
            <>
              <StatCard
                icon={<FiBriefcase className="w-8 h-8 text-primary-600" />}
                title="Total Jobs"
                value={dashboardData?.workerStats?.totalJobs || 0}
                subtitle={`${dashboardData?.workerStats?.activeJobs || 0} active`}
                bgColor="bg-gradient-to-br from-primary-50 to-primary-100"
              />
              <StatCard
                icon={<FiDollarSign className="w-8 h-8 text-green-600" />}
                title="Total Earnings"
                value={`₹${dashboardData?.workerStats?.totalEarnings?.toLocaleString() || 0}`}
                subtitle="This month: ₹12,500"
                bgColor="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                icon={<FiStar className="w-8 h-8 text-yellow-600" />}
                title="Average Rating"
                value={dashboardData?.workerStats?.averageRating || 0}
                subtitle={`${dashboardData?.workerStats?.totalReviews || 0} reviews`}
                bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
              />
              <StatCard
                icon={<FiTrendingUp className="w-8 h-8 text-blue-600" />}
                title="Completion Rate"
                value={`${dashboardData?.workerStats?.completionRate || 0}%`}
                subtitle={`${dashboardData?.workerStats?.responseRate || 0}% response rate`}
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={<FiCalendar className="w-8 h-8 text-primary-600" />}
                title="Total Bookings"
                value={dashboardData?.stats?.totalBookings || 0}
                subtitle={`${dashboardData?.stats?.activeBookings || 0} active`}
                bgColor="bg-gradient-to-br from-primary-50 to-primary-100"
              />
              <StatCard
                icon={<FiCheckCircle className="w-8 h-8 text-green-600" />}
                title="Completed"
                value={dashboardData?.stats?.completedBookings || 0}
                subtitle="Services completed"
                bgColor="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                icon={<FiAlertCircle className="w-8 h-8 text-yellow-600" />}
                title="Pending"
                value={dashboardData?.stats?.pendingBookings || 0}
                subtitle="Awaiting confirmation"
                bgColor="bg-gradient-to-br from-yellow-50 to-yellow-100"
              />
              <StatCard
                icon={<FiDollarSign className="w-8 h-8 text-blue-600" />}
                title="Total Spent"
                value={`₹${dashboardData?.stats?.totalSpent?.toLocaleString() || 0}`}
                subtitle="All time"
                bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              />
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <TabButton
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                icon={<FiUser />}
                label="Overview"
              />
              <TabButton
                active={activeTab === 'bookings'}
                onClick={() => setActiveTab('bookings')}
                icon={<FiCalendar />}
                label={user?.role === 'worker' ? 'Jobs' : 'Bookings'}
              />
              <TabButton
                active={activeTab === 'reviews'}
                onClick={() => setActiveTab('reviews')}
                icon={<FiStar />}
                label="Reviews"
              />
              {user?.role === 'worker' && (
                <TabButton
                  active={activeTab === 'earnings'}
                  onClick={() => setActiveTab('earnings')}
                  icon={<FiDollarSign />}
                  label="Earnings"
                />
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                user={user} 
                dashboardData={dashboardData}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            )}
            {activeTab === 'bookings' && (
              <BookingsTab 
                user={user}
                bookings={dashboardData?.recentBookings || []}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            )}
            {activeTab === 'reviews' && <ReviewsTab user={user} />}
            {activeTab === 'earnings' && user?.role === 'worker' && (
              <EarningsTab stats={dashboardData?.workerStats} />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.role === 'worker' ? (
            <>
              <QuickActionCard
                icon={<FiEdit className="w-6 h-6" />}
                title="Update Profile"
                description="Edit your skills and availability"
                link="/profile/edit"
                color="primary"
              />
              <QuickActionCard
                icon={<FiCalendar className="w-6 h-6" />}
                title="View Schedule"
                description="Check your upcoming jobs"
                link="/schedule"
                color="blue"
              />
              <QuickActionCard
                icon={<FiUsers className="w-6 h-6" />}
                title="Client Reviews"
                description="See what clients are saying"
                link="/reviews"
                color="green"
              />
            </>
          ) : (
            <>
              <QuickActionCard
                icon={<FiMapPin className="w-6 h-6" />}
                title="Find Workers"
                description="Search for local service providers"
                link="/workers"
                color="primary"
              />
              <QuickActionCard
                icon={<FiCalendar className="w-6 h-6" />}
                title="Book Service"
                description="Schedule a new appointment"
                link="/workers"
                color="blue"
              />
              <QuickActionCard
                icon={<FiMessageSquare className="w-6 h-6" />}
                title="Support"
                description="Get help with your bookings"
                link="/support"
                color="green"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, bgColor }) => (
  <div className={`${bgColor} rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white rounded-lg shadow-sm">
        {icon}
      </div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
      active
        ? 'border-primary-600 text-primary-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Overview Tab
const OverviewTab = ({ user, dashboardData, getStatusColor, getStatusIcon }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Recent {user?.role === 'worker' ? 'Jobs' : 'Bookings'}
      </h3>
      <div className="space-y-3">
        {dashboardData?.recentBookings?.slice(0, 5).map((booking) => (
          <div
            key={booking._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiBriefcase className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{booking.serviceType}</h4>
                <p className="text-sm text-gray-600">
                  {user?.role === 'worker' ? 'Client: ' : 'Worker: '}
                  {booking.workerName}
                </p>
                <p className="text-xs text-gray-500">{booking.date}</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  booking.status
                )}`}
              >
                {getStatusIcon(booking.status)}
                {booking.status}
              </span>
              <p className="text-sm font-semibold text-gray-900 mt-2">₹{booking.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {user?.role === 'worker' && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border border-primary-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiTrendingUp className="text-primary-600" />
            Performance Metrics
          </h4>
          <div className="space-y-2">
            <MetricRow label="Response Rate" value={`${dashboardData?.workerStats?.responseRate}%`} />
            <MetricRow label="Completion Rate" value={`${dashboardData?.workerStats?.completionRate}%`} />
            <MetricRow label="Average Rating" value={`${dashboardData?.workerStats?.averageRating}/5.0`} />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiDollarSign className="text-green-600" />
            Earnings Summary
          </h4>
          <div className="space-y-2">
            <MetricRow label="This Month" value="₹12,500" />
            <MetricRow label="Last Month" value="₹10,200" />
            <MetricRow label="Total Earnings" value={`₹${dashboardData?.workerStats?.totalEarnings?.toLocaleString()}`} />
          </div>
        </div>
      </div>
    )}
  </div>
);

// Bookings Tab
const BookingsTab = ({ user, bookings, getStatusColor, getStatusIcon }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-gray-900">
        All {user?.role === 'worker' ? 'Jobs' : 'Bookings'}
      </h3>
      <select className="input py-2 px-4">
        <option>All Status</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
        <option>Cancelled</option>
      </select>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {user?.role === 'worker' ? 'Client' : 'Worker'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg mr-3">
                    <FiBriefcase className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="font-medium text-gray-900">{booking.serviceType}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {booking.workerName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {booking.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {getStatusIcon(booking.status)}
                  {booking.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                ₹{booking.amount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-primary-600 hover:text-primary-700 mr-3">
                  <FiEye className="w-4 h-4" />
                </button>
                {booking.status === 'completed' && (
                  <button className="text-yellow-600 hover:text-yellow-700">
                    <FiStar className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Reviews Tab
const ReviewsTab = ({ user }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">
      {user?.role === 'worker' ? 'Client Reviews' : 'Your Reviews'}
    </h3>
    <div className="space-y-4">
      {[1, 2, 3].map((_, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                <FiUser className="text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Client Name</h4>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
          <p className="text-gray-600 text-sm">
            Excellent service! Very professional and completed the work on time. Highly recommended!
          </p>
        </div>
      ))}
    </div>
  </div>
);

// Earnings Tab
const EarningsTab = ({ stats }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Earnings Overview</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <h4 className="text-sm text-gray-600 mb-2">Total Earnings</h4>
        <p className="text-3xl font-bold text-gray-900">₹{stats?.totalEarnings?.toLocaleString()}</p>
        <p className="text-xs text-green-600 mt-1">+12% from last month</p>
      </div>
      
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="text-sm text-gray-600 mb-2">This Month</h4>
        <p className="text-3xl font-bold text-gray-900">₹12,500</p>
        <p className="text-xs text-blue-600 mt-1">{stats?.activeJobs} active jobs</p>
      </div>
      
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <h4 className="text-sm text-gray-600 mb-2">Average per Job</h4>
        <p className="text-3xl font-bold text-gray-900">₹{Math.round((stats?.totalEarnings || 0) / (stats?.completedJobs || 1))}</p>
        <p className="text-xs text-purple-600 mt-1">{stats?.completedJobs} jobs completed</p>
      </div>
    </div>

    <div className="p-6 bg-white rounded-xl border">
      <h4 className="font-semibold text-gray-900 mb-4">Recent Transactions</h4>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiDollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Payment Received</p>
                <p className="text-sm text-gray-600">Plumbing Service - Job #12345</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">+₹800</p>
              <p className="text-xs text-gray-500">Oct 15, 2025</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Quick Action Card
const QuickActionCard = ({ icon, title, description, link, color }) => {
  const colors = {
    primary: 'from-primary-50 to-blue-50 border-primary-200 hover:border-primary-300',
    blue: 'from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300',
    green: 'from-green-50 to-emerald-50 border-green-200 hover:border-green-300',
  };

  return (
    <Link
      to={link}
      className={`block p-6 bg-gradient-to-br ${colors[color]} rounded-xl border hover:shadow-md transition-all`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

// Metric Row Component
const MetricRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

export default Dashboard;
