import { useState, useEffect } from 'react';
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
} from 'react-icons/fi';

// Import Dashboard Sections
import EarningsSection from '../components/dashboard/EarningsSection';
import ReviewsSection from '../components/dashboard/ReviewsSection';
import AvailabilitySection from '../components/dashboard/AvailabilitySection';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Check if user is actually a worker
  useEffect(() => {
    if (!user || user.role !== 'worker') {
      toast.error('Access denied. Worker account required.');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'worker') {
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
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">New job request from John Doe</p>
                          <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">Payment of ₹500 received</p>
                          <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">New review received - 5 stars!</p>
                          <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Worker Account</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <FiUser className="text-primary-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out pt-16 lg:pt-0`}
        >
          <div className="h-full overflow-y-auto py-6">
            <nav className="px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="px-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {/* Content will be rendered based on activeTab */}
          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'jobs' && <ActiveJobsSection />}
          {activeTab === 'history' && <JobHistorySection />}
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

// Overview Section Component
const OverviewSection = () => {
  const stats = [
    { label: 'Total Earnings', value: '₹45,250', change: '+12%', icon: FiDollarSign, color: 'green' },
    { label: 'Active Jobs', value: '8', change: '+3', icon: FiBriefcase, color: 'blue' },
    { label: 'Completed Jobs', value: '127', change: '+15', icon: FiCheckCircle, color: 'purple' },
    { label: 'Average Rating', value: '4.8', change: '+0.2', icon: FiStar, color: 'yellow' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} this month
                  </p>
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
        {/* Pending Requests */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests (3)</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Plumbing Service</h4>
                    <p className="text-sm text-gray-600 mt-1">Client: Rahul Sharma</p>
                    <p className="text-sm text-gray-600">Location: Andheri, Mumbai</p>
                    <p className="text-sm text-primary-600 mt-2">₹500 - Estimated 2 hours</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="btn btn-primary btn-sm flex-1">Accept</button>
                  <button className="btn btn-outline btn-sm flex-1">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            <div className="flex gap-4 p-3 border-l-4 border-green-500 bg-green-50 rounded">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">10:00</p>
                <p className="text-xs text-gray-600">AM</p>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Electrical Repair</h4>
                <p className="text-sm text-gray-600">Client: Priya Patel</p>
                <p className="text-sm text-gray-600">Bandra, Mumbai</p>
              </div>
              <button className="btn btn-sm btn-primary h-fit">Start</button>
            </div>

            <div className="flex gap-4 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">2:00</p>
                <p className="text-xs text-gray-600">PM</p>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Carpentry Work</h4>
                <p className="text-sm text-gray-600">Client: Amit Kumar</p>
                <p className="text-sm text-gray-600">Powai, Mumbai</p>
              </div>
              <button className="btn btn-sm btn-outline h-fit">View</button>
            </div>

            <div className="flex gap-4 p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">5:00</p>
                <p className="text-xs text-gray-600">PM</p>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">AC Servicing</h4>
                <p className="text-sm text-gray-600">Client: Neha Singh</p>
                <p className="text-sm text-gray-600">Juhu, Mumbai</p>
              </div>
              <button className="btn btn-sm btn-outline h-fit">View</button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings This Month</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {[3200, 4100, 2800, 5200, 4500, 3800, 6100, 5500].map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors cursor-pointer"
                style={{ height: `${(value / 6100) * 100}%` }}
                title={`₹${value}`}
              ></div>
              <span className="text-xs text-gray-600">W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Placeholder components (will be built next)
const ActiveJobsSection = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  // Mock data - will be replaced with API calls
  const jobs = [
    {
      id: 1,
      status: 'pending',
      service: 'Plumbing Service',
      description: 'Fix leaking tap in kitchen and bathroom',
      client: { name: 'Rahul Sharma', phone: '+91 98765 43210', rating: 4.5 },
      location: { address: '304, Shivaji Nagar, Andheri West', city: 'Mumbai', distance: '2.3 km' },
      timing: { date: '2025-10-20', time: '10:00 AM', duration: '2 hours' },
      pricing: { amount: 500, estimatedTotal: 1000 },
      urgent: true,
    },
    {
      id: 2,
      status: 'accepted',
      service: 'Electrical Repair',
      description: 'Install new ceiling fan and fix switchboard',
      client: { name: 'Priya Patel', phone: '+91 98123 45678', rating: 5.0 },
      location: { address: 'B-201, Sai Kripa Complex, Bandra', city: 'Mumbai', distance: '5.1 km' },
      timing: { date: '2025-10-19', time: '2:00 PM', duration: '3 hours' },
      pricing: { amount: 600, estimatedTotal: 1800 },
      urgent: false,
    },
    {
      id: 3,
      status: 'in-progress',
      service: 'Carpentry Work',
      description: 'Repair wooden wardrobe door hinges',
      client: { name: 'Amit Kumar', phone: '+91 97654 32109', rating: 4.8 },
      location: { address: '15/A, Green Valley Society, Powai', city: 'Mumbai', distance: '3.7 km' },
      timing: { date: '2025-10-18', time: '11:00 AM', duration: '1.5 hours' },
      pricing: { amount: 400, estimatedTotal: 600 },
      urgent: false,
    },
    {
      id: 4,
      status: 'pending',
      service: 'AC Repair',
      description: 'AC not cooling properly, needs servicing',
      client: { name: 'Neha Singh', phone: '+91 99876 54321', rating: 4.2 },
      location: { address: 'Flat 802, Skyline Towers, Juhu', city: 'Mumbai', distance: '7.8 km' },
      timing: { date: '2025-10-21', time: '4:00 PM', duration: '2 hours' },
      pricing: { amount: 800, estimatedTotal: 1600 },
      urgent: false,
    },
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = job.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.client.name.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleAcceptJob = (jobId) => {
    toast.success('Job accepted successfully!');
    // API call to accept job
  };

  const handleRejectJob = (jobId) => {
    toast.error('Job declined');
    // API call to reject job
  };

  const handleStartJob = (jobId) => {
    toast.success('Job started! Timer running...');
    // API call to start job
  };

  const handleCompleteJob = (jobId) => {
    toast.success('Job marked as complete!');
    // API call to complete job
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
          <p className="text-gray-600 mt-1">Manage your ongoing and pending jobs</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {jobs.filter(j => j.status === 'pending').length} Pending
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {jobs.filter(j => j.status === 'in-progress').length} Active
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full"
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

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Job Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
                      {job.urgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{job.description}</p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{job.client.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <FiPhone size={14} />
                        <span>{job.client.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-yellow-600 mt-1">
                        <FiStar size={14} fill="currentColor" />
                        <span>{job.client.rating} rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{job.location.address}</p>
                      <p className="text-sm text-gray-600">{job.location.city}</p>
                      <p className="text-sm text-primary-600 mt-1">{job.location.distance} away</p>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiClock className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.timing.date}</p>
                      <p className="text-sm text-gray-600">{job.timing.time}</p>
                      <p className="text-sm text-gray-600">Duration: {job.timing.duration}</p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiDollarSign className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">₹{job.pricing.amount}/hour</p>
                      <p className="text-lg font-bold text-gray-900">₹{job.pricing.estimatedTotal}</p>
                      <p className="text-xs text-gray-500">Estimated total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2 lg:w-40">
                {job.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="btn btn-primary flex-1 lg:w-full"
                    >
                      <FiCheckCircle className="mr-2" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectJob(job.id)}
                      className="btn btn-outline flex-1 lg:w-full"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowJobModal(true);
                      }}
                      className="btn btn-outline flex-1 lg:w-full"
                    >
                      View Details
                    </button>
                  </>
                )}

                {job.status === 'accepted' && (
                  <>
                    <button
                      onClick={() => handleStartJob(job.id)}
                      className="btn btn-primary flex-1 lg:w-full"
                    >
                      Start Job
                    </button>
                    <button className="btn btn-outline flex-1 lg:w-full">
                      <FiPhone className="mr-2" />
                      Call Client
                    </button>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowJobModal(true);
                      }}
                      className="btn btn-outline flex-1 lg:w-full"
                    >
                      View Details
                    </button>
                  </>
                )}

                {job.status === 'in-progress' && (
                  <>
                    <button
                      onClick={() => handleCompleteJob(job.id)}
                      className="btn btn-primary flex-1 lg:w-full"
                    >
                      Complete Job
                    </button>
                    <button className="btn btn-outline flex-1 lg:w-full">
                      <FiPhone className="mr-2" />
                      Call Client
                    </button>
                    <button className="btn btn-outline flex-1 lg:w-full">
                      Add Notes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="card text-center py-12">
          <FiAlertCircle className="mx-auto text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mt-4">No jobs found</h3>
          <p className="text-gray-600 mt-2">Try adjusting your filters or search query</p>
        </div>
      )}
    </div>
  );
};

const JobHistorySection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const itemsPerPage = 10;

  // Mock data
  const jobHistory = [
    {
      id: 101,
      date: '2025-10-15',
      service: 'Plumbing Service',
      client: 'Raj Kumar',
      location: 'Andheri, Mumbai',
      duration: '2 hours',
      amount: 1000,
      status: 'completed',
      rating: 5,
      review: 'Excellent work! Very professional.',
    },
    {
      id: 102,
      date: '2025-10-14',
      service: 'Electrical Repair',
      client: 'Sita Patel',
      location: 'Bandra, Mumbai',
      duration: '1.5 hours',
      amount: 900,
      status: 'completed',
      rating: 4,
      review: 'Good job, on time.',
    },
    {
      id: 103,
      date: '2025-10-13',
      service: 'AC Servicing',
      client: 'Amit Shah',
      location: 'Juhu, Mumbai',
      duration: '3 hours',
      amount: 2400,
      status: 'cancelled',
      rating: null,
      review: null,
    },
    {
      id: 104,
      date: '2025-10-12',
      service: 'Carpentry',
      client: 'Priya Singh',
      location: 'Powai, Mumbai',
      duration: '2.5 hours',
      amount: 1500,
      status: 'completed',
      rating: 5,
      review: 'Amazing work! Highly recommended.',
    },
    {
      id: 105,
      date: '2025-10-10',
      service: 'Painting',
      client: 'Neha Gupta',
      location: 'Malad, Mumbai',
      duration: '4 hours',
      amount: 3200,
      status: 'completed',
      rating: 4,
      review: 'Quality work.',
    },
  ];

  const filteredHistory = filterStatus === 'all'
    ? jobHistory
    : jobHistory.filter(job => job.status === filterStatus);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const currentJobs = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const headers = ['Date', 'Service', 'Client', 'Location', 'Duration', 'Amount', 'Status', 'Rating'];
    const csvData = filteredHistory.map(job => [
      job.date,
      job.service,
      job.client,
      job.location,
      job.duration,
      job.amount,
      job.status,
      job.rating || 'N/A',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Job history exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job History</h2>
          <p className="text-gray-600 mt-1">View all your past jobs and earnings</p>
        </div>
        <button onClick={exportToCSV} className="btn btn-outline flex items-center gap-2">
          <FiFileText />
          Export to CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-700">Total Jobs Completed</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {jobHistory.filter(j => j.status === 'completed').length}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-700">Total Earnings</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            ₹{jobHistory.filter(j => j.status === 'completed').reduce((sum, j) => sum + j.amount, 0)}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
          <p className="text-sm text-yellow-700">Average Rating</p>
          <p className="text-3xl font-bold text-yellow-900 mt-2 flex items-center gap-1">
            {(jobHistory.filter(j => j.rating).reduce((sum, j) => sum + j.rating, 0) / 
              jobHistory.filter(j => j.rating).length).toFixed(1)}
            <FiStar className="text-2xl" fill="currentColor" />
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-2 flex-wrap">
          {['all', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
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

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Service</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Client</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{job.date}</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{job.service}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{job.client}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{job.location}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{job.duration}</td>
                <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{job.amount}</td>
                <td className="py-3 px-4">
                  {job.rating ? (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <FiStar size={16} fill="currentColor" />
                      <span className="text-sm font-medium">{job.rating}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Placeholder components for sections not yet implemented
const ProfileSection = () => <div className="card"><h2 className="text-2xl font-bold">Profile</h2><p className="text-gray-600 mt-2">Building in progress...</p></div>;
const DocumentsSection = () => <div className="card"><h2 className="text-2xl font-bold">Documents</h2><p className="text-gray-600 mt-2">Building in progress...</p></div>;
const SettingsSection = () => <div className="card"><h2 className="text-2xl font-bold">Settings</h2><p className="text-gray-600 mt-2">Building in progress...</p></div>;

export default WorkerDashboard;
