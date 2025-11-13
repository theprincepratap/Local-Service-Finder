import { useEffect, useState } from 'react';
import {
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import apiService from '../../services/apiService';
import { toast } from 'react-hot-toast';

const OverviewTab = ({ stats, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    try {
      // Load recent bookings, users, workers
      const [bookingsRes, usersRes, workersRes] = await Promise.all([
        apiService.admin.getAllBookings({ limit: 5, sort: '-createdAt' }),
        apiService.admin.getAllUsers({ limit: 5, sort: '-createdAt' }),
        apiService.admin.getAllWorkers({ limit: 5, sort: '-createdAt' }),
      ]);

      const activities = [
        ...bookingsRes.data.bookings.map(b => ({
          type: 'booking',
          icon: FiCalendar,
          color: 'blue',
          title: 'New Booking',
          description: `Booking #${b._id?.slice(-6)} created`,
          time: new Date(b.createdAt),
        })),
        ...usersRes.data.users.map(u => ({
          type: 'user',
          icon: FiUsers,
          color: 'green',
          title: 'New User',
          description: `${u.name} joined`,
          time: new Date(u.createdAt),
        })),
        ...workersRes.data.workers.map(w => ({
          type: 'worker',
          icon: FiBriefcase,
          color: 'purple',
          title: 'Worker Registration',
          description: `${w.name} registered`,
          time: new Date(w.createdAt),
        })),
      ];

      // Sort by time and take top 10
      activities.sort((a, b) => b.time - a.time);
      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('Load activities error:', error);
    }
  };

  const StatCard = ({ icon: Icon, label, value, trend, trendValue, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon: Icon, title, count, color, onClick }) => (
    <button
      onClick={onClick}
      className={`bg-white rounded-lg border-2 border-${color}-200 p-4 hover:border-${color}-400 hover:shadow-md transition-all text-left w-full`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 text-${color}-600`} />
        {count > 0 && (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-700`}>
            {count}
          </span>
        )}
      </div>
      <p className="font-medium text-gray-900">{title}</p>
    </button>
  );

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiUsers}
          label="Total Users"
          value={stats.totalUsers || 0}
          trend={stats.userGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.userGrowth || 0)}%`}
          color="blue"
        />
        <StatCard
          icon={FiBriefcase}
          label="Total Workers"
          value={stats.totalWorkers || 0}
          trend={stats.workerGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.workerGrowth || 0)}%`}
          color="purple"
        />
        <StatCard
          icon={FiCalendar}
          label="Total Bookings"
          value={stats.totalBookings || 0}
          trend={stats.bookingGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.bookingGrowth || 0)}%`}
          color="green"
        />
        <StatCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
          trend={stats.revenueGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.revenueGrowth || 0)}%`}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            icon={FiAlertCircle}
            title="Pending Approvals"
            count={stats.pendingApprovals || 0}
            color="orange"
            onClick={() => {}}
          />
          <QuickActionCard
            icon={FiClock}
            title="Active Bookings"
            count={stats.activeBookings || 0}
            color="blue"
            onClick={() => {}}
          />
          <QuickActionCard
            icon={FiCheckCircle}
            title="Completed Today"
            count={stats.completedToday || 0}
            color="green"
            onClick={() => {}}
          />
          <QuickActionCard
            icon={FiStar}
            title="New Reviews"
            count={stats.newReviews || 0}
            color="yellow"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Recent Activities and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button
              onClick={loadRecentActivities}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activities</p>
            ) : (
              recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className={`p-2 rounded-lg bg-${activity.color}-50 flex-shrink-0`}>
                      <Icon className={`w-4 h-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimeAgo(activity.time)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Active Workers</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.activeWorkers || 0} / {stats.totalWorkers || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.totalWorkers > 0 ? (stats.activeWorkers / stats.totalWorkers) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Pending Approvals</span>
                <span className="text-sm font-semibold text-gray-900">{stats.pendingApprovals || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.totalWorkers > 0 ? (stats.pendingApprovals / stats.totalWorkers) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Booking Success Rate</span>
                <span className="text-sm font-semibold text-gray-900">{stats.bookingSuccessRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.bookingSuccessRate || 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                  {stats.averageRating || 0} / 5
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full transition-all"
                  style={{ width: `${((stats.averageRating || 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
