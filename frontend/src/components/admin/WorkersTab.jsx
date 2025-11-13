import { useState, useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import apiService from '../../services/apiService';
import { toast } from 'react-hot-toast';

const WorkersTab = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionModal, setActionModal] = useState({ show: false, type: '', worker: null });
  const [actionMessage, setActionMessage] = useState('');
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    approvalStatus: 'all',
    status: 'all',
  });

  useEffect(() => {
    loadWorkers();
  }, [filters]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllWorkers(filters);
      setWorkers(response.data.workers || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Load workers error:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workerId) => {
    try {
      await apiService.admin.approveWorker(workerId, actionMessage);
      toast.success('Worker approved successfully');
      loadWorkers();
      setActionModal({ show: false, type: '', worker: null });
      setActionMessage('');
    } catch (error) {
      console.error('Approve worker error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve worker');
    }
  };

  const handleReject = async (workerId) => {
    if (!actionMessage.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await apiService.admin.rejectWorker(workerId, actionMessage);
      toast.success('Worker rejected');
      loadWorkers();
      setActionModal({ show: false, type: '', worker: null });
      setActionMessage('');
    } catch (error) {
      console.error('Reject worker error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject worker');
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const ActionModal = () => {
    if (!actionModal.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {actionModal.type === 'approve' ? 'Approve Worker' : 'Reject Worker'}
          </h3>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Worker: {actionModal.worker?.name}</p>
            <p className="text-gray-600 mb-4">Email: {actionModal.worker?.email}</p>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {actionModal.type === 'approve' ? 'Approval Message (Optional)' : 'Rejection Reason *'}
            </label>
            <textarea
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              placeholder={actionModal.type === 'approve' 
                ? 'Welcome message for the worker...' 
                : 'Reason for rejection...'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="4"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setActionModal({ show: false, type: '', worker: null });
                setActionMessage('');
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (actionModal.type === 'approve') {
                  handleApprove(actionModal.worker._id);
                } else {
                  handleReject(actionModal.worker._id);
                }
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                actionModal.type === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionModal.type === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const WorkerDetailsModal = () => {
    if (!showModal || !selectedWorker) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedWorker.name}</h3>
                <p className="text-gray-600 mt-1">{selectedWorker.email}</p>
              </div>
              <button
                onClick={() => {
                  console.log('❌ Closing modal');
                  setShowModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="mt-4">
              {getStatusBadge(selectedWorker.approvalStatus)}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone className="w-4 h-4" />
                  <span>{selectedWorker.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMail className="w-4 h-4" />
                  <span>{selectedWorker.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMapPin className="w-4 h-4" />
                  <span>{selectedWorker.address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Professional Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiBriefcase className="w-4 h-4" />
                  <span>Services: {selectedWorker.services?.join(', ') || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiClock className="w-4 h-4" />
                  <span>Experience: {selectedWorker.experience || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedWorker.bio && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Bio</h4>
                <p className="text-gray-600">{selectedWorker.bio}</p>
              </div>
            )}

            {/* Registration Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Registration Details</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  Registered: {new Date(selectedWorker.createdAt).toLocaleDateString()}
                </p>
                {selectedWorker.approvedAt && (
                  <p className="text-gray-600">
                    Approved: {new Date(selectedWorker.approvedAt).toLocaleDateString()}
                  </p>
                )}
                {selectedWorker.rejectedAt && (
                  <p className="text-gray-600">
                    Rejected: {new Date(selectedWorker.rejectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedWorker.approvalStatus === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setActionModal({ show: true, type: 'approve', worker: selectedWorker });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setActionModal({ show: true, type: 'reject', worker: selectedWorker });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FiXCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Approval Status Filter */}
          <select
            value={filters.approvalStatus}
            onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Active Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Workers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Workers ({pagination.total || 0})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-12">
            <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No workers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workers.map((worker) => (
                    <tr key={worker._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">
                                {worker.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                            <div className="text-sm text-gray-500">
                              ID: {worker._id?.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{worker.email}</div>
                        <div className="text-sm text-gray-500">{worker.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {worker.services?.slice(0, 2).join(', ') || 'Not specified'}
                          {worker.services?.length > 2 && ` +${worker.services.length - 2} more`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(worker.approvalStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              console.log('👁️ Eye button clicked for worker:', worker.name);
                              setSelectedWorker(worker);
                              setShowModal(true);
                              console.log('✅ Modal state updated - showModal should be true');
                            }}
                            className="text-blue-600 hover:text-blue-900 hover:scale-125 transition-all cursor-pointer"
                            title="View Details"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          {worker.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => setActionModal({ show: true, type: 'approve', worker })}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Approve"
                              >
                                <FiUserCheck className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setActionModal({ show: true, type: 'reject', worker })}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Reject"
                              >
                                <FiUserX className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <WorkerDetailsModal />
      <ActionModal />
    </div>
  );
};

export default WorkersTab;
