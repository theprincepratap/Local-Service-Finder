import { useState, useEffect } from 'react';
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiAlertCircle,
  FiToggleLeft,
  FiToggleRight,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiXCircle,
  FiUser,
} from 'react-icons/fi';
import apiService from '../../services/apiService';
import { toast } from 'react-hot-toast';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [toggleModal, setToggleModal] = useState({ show: false, user: null, reason: '' });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.admin.getAllUsers(filters);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Load users error:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await apiService.admin.toggleUserStatus(userId, toggleModal.reason);
      toast.success('User status updated');
      loadUsers();
      setToggleModal({ show: false, user: null, reason: '' });
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await apiService.admin.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
      setDeleteModal({ show: false, user: null });
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const ToggleStatusModal = () => {
    if (!toggleModal.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {toggleModal.user?.isActive ? 'Deactivate User' : 'Activate User'}
          </h3>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-2">User: {toggleModal.user?.name}</p>
            <p className="text-gray-600 mb-4">Email: {toggleModal.user?.email}</p>
            
            {toggleModal.user?.isActive && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Deactivation (Optional)
                </label>
                <textarea
                  value={toggleModal.reason}
                  onChange={(e) => setToggleModal({ ...toggleModal, reason: e.target.value })}
                  placeholder="Reason for deactivation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                />
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setToggleModal({ show: false, user: null, reason: '' })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleToggleStatus(toggleModal.user._id)}
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                toggleModal.user?.isActive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {toggleModal.user?.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteModal = () => {
    if (!deleteModal.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete User</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{deleteModal.user?.name}</p>
              <p className="text-sm text-gray-600">{deleteModal.user?.email}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ show: false, user: null })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteUser(deleteModal.user._id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const UserDetailsModal = () => {
    if (!showModal || !selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-700">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                  <div className="mt-2">{getStatusBadge(selectedUser.isActive)}</div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiUser className="w-5 h-5" />
                Contact Information
              </h4>
              <div className="space-y-2 ml-7">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPhone className="w-4 h-4" />
                  <span>{selectedUser.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMail className="w-4 h-4" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMapPin className="w-4 h-4" />
                  <span>{selectedUser.address || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                Account Details
              </h4>
              <div className="space-y-2 ml-7 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">User ID:</span> {selectedUser._id}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Joined:</span>{' '}
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email Verified:</span>{' '}
                  {selectedUser.emailVerified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setToggleModal({ show: true, user: selectedUser, reason: '' });
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                  selectedUser.isActive
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedUser.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                {selectedUser.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeleteModal({ show: true, user: selectedUser });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Users ({pagination.total || 0})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
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
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">ID: {user._id?.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.isActive)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Details"
                          >
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setToggleModal({ show: true, user, reason: '' })}
                            className={`${
                              user.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                            } transition-colors`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, user })}
                            className="text-red-600 hover:text-red-900 transition-colors"
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
      <UserDetailsModal />
      <ToggleStatusModal />
      <DeleteModal />
    </div>
  );
};

export default UsersTab;
