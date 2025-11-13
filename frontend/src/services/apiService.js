import api from './api';

// Auth Services
export const authService = {
  register: async (userData) => {
    try {
      console.log('Registering user:', userData);
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('📡 [API SERVICE] Sending login request for:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      console.log('✅ [API SERVICE] Login response received:', {
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        hasSuccess: response.data.success,
        tokenLength: response.data.token?.length || 0
      });
      
      console.log('📦 [API SERVICE] Response data:', response.data);
      
      if (response.data.token) {
        console.log('💾 [API SERVICE] Token from response:', response.data.token.substring(0, 30) + '...');
        localStorage.setItem('token', response.data.token);
        console.log('✅ [API SERVICE] Token saved to localStorage');
      } else {
        console.error('❌ [API SERVICE] Response has NO token!');
      }
      
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API SERVICE] Login error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        fullError: error
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/updatedetails', data);
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await api.put('/auth/updatepassword', data);
    return response.data;
  },

  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    
    // Don't set Content-Type header - let browser set it with boundary
    const response = await api.post('/auth/upload-photo', formData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password, confirmPassword) => {
    const response = await api.post(`/auth/reset-password/${token}`, { 
      password, 
      confirmPassword 
    });
    return response.data;
  },

  // Admin Auth Methods
  adminLogin: async (credentials) => {
    try {
      console.log('Admin logging in with:', credentials.email);
      const response = await api.post('/auth/admin/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      console.log('Admin login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin login error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAdminMe: async () => {
    const response = await api.get('/auth/admin/me');
    return response.data;
  },

  updateAdminProfile: async (data) => {
    const response = await api.put('/auth/admin/updatedetails', data);
    return response.data;
  },

  updateAdminPassword: async (data) => {
    const response = await api.put('/auth/admin/updatepassword', data);
    return response.data;
  },

  adminForgotPassword: async (email) => {
    const response = await api.post('/auth/admin/forgotpassword', { email });
    return response.data;
  },

  adminResetPassword: async (token, password) => {
    const response = await api.post(`/auth/admin/resetpassword/${token}`, { password });
    return response.data;
  },

  getAdminActivityLog: async () => {
    const response = await api.get('/auth/admin/activity-log');
    return response.data;
  },
};

// Worker Services
export const workerService = {
  getNearbyWorkers: async (params) => {
    const response = await api.get('/workers/nearby', { params });
    return response.data;
  },

  getWorkerById: async (id) => {
    const response = await api.get(`/workers/${id}`);
    return response.data;
  },

  registerAsWorker: async (data) => {
    const response = await api.post('/workers/register', data);
    return response.data;
  },

  getWorkerProfile: async () => {
    const response = await api.get('/workers/profile');
    return response.data;
  },

  updateWorkerProfile: async (data) => {
    const response = await api.put('/workers/profile', data);
    return response.data;
  },

  uploadProfileImage: async (formData) => {
    const response = await api.post('/workers/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadWorkerDocument: async (formData) => {
    const response = await api.post('/workers/profile/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateAvailability: async (availability) => {
    const response = await api.put('/workers/availability', { availability });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/workers/dashboard/stats');
    return response.data;
  },
};

// Booking Services
export const bookingService = {
  createBooking: async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getUserBookings: async (params) => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  getWorkerBookings: async (params) => {
    const response = await api.get('/bookings/worker-bookings', { params });
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  updateBookingStatus: async (id, status, rejectionReason) => {
    const response = await api.put(`/bookings/${id}/status`, {
      status,
      rejectionReason,
    });
    return response.data;
  },

  cancelBooking: async (id, cancellationReason) => {
    const response = await api.put(`/bookings/${id}/cancel`, {
      cancellationReason,
    });
    return response.data;
  },

  // Real-time location tracking
  updateWorkerLocation: async (bookingId, latitude, longitude) => {
    const response = await api.put(`/bookings/${bookingId}/worker-location`, {
      latitude,
      longitude,
    });
    return response.data;
  },

  getWorkerLocation: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/worker-location`);
    return response.data;
  },
};

// User Services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  updateLocation: async (locationData) => {
    const response = await api.put('/users/location', locationData);
    return response.data;
  },

  getLocationHistory: async (limit = 10) => {
    const response = await api.get(`/users/location/history?limit=${limit}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/users/dashboard/stats');
    return response.data;
  },

  getUserBookings: async (params) => {
    const response = await api.get('/users/bookings', { params });
    return response.data;
  },

  getRecentBookings: async (limit = 5) => {
    const response = await api.get(`/users/bookings/recent?limit=${limit}`);
    return response.data;
  },

  getNotifications: async (params) => {
    const response = await api.get('/users/notifications', { params });
    return response.data;
  },

  getUserReviews: async (params) => {
    const response = await api.get('/users/reviews', { params });
    return response.data;
  },

  searchWorkers: async (params) => {
    const response = await api.get('/users/search-workers', { params });
    return response.data;
  },
};

// Review Services
export const reviewService = {
  createReview: async (data) => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  getWorkerReviews: async (workerId, params) => {
    const response = await api.get(`/reviews/worker/${workerId}`, { params });
    return response.data;
  },

  getUserReviews: async (params) => {
    const response = await api.get('/reviews/user', { params });
    return response.data;
  },

  updateReview: async (id, data) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  respondToReview: async (id, comment) => {
    const response = await api.put(`/reviews/${id}/response`, { comment });
    return response.data;
  },

  markHelpful: async (id) => {
    const response = await api.put(`/reviews/${id}/helpful`);
    return response.data;
  },

  getReviewStats: async (workerId) => {
    const response = await api.get(`/reviews/worker/${workerId}/stats`);
    return response.data;
  },
};

// Default export with all services
// Admin Services
export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getSystemStats: async () => {
    const response = await api.get('/admin/system/stats');
    return response.data;
  },

  getRevenueAnalytics: async (period = 'monthly') => {
    const response = await api.get('/admin/revenue/analytics', { params: { period } });
    return response.data;
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleUserStatus: async (userId, reason = '') => {
    const response = await api.patch(`/admin/users/${userId}/toggle-status`, { reason });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Worker Management
  getAllWorkers: async (params = {}) => {
    const response = await api.get('/admin/workers', { params });
    return response.data;
  },

  approveWorker: async (workerId, message = '') => {
    const response = await api.patch(`/admin/workers/${workerId}/approve`, { message });
    return response.data;
  },

  rejectWorker: async (workerId, reason) => {
    const response = await api.patch(`/admin/workers/${workerId}/reject`, { reason });
    return response.data;
  },

  // Booking Management
  getAllBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  updateBookingStatus: async (bookingId, status, adminNotes = '') => {
    const response = await api.patch(`/admin/bookings/${bookingId}/status`, { status, adminNotes });
    return response.data;
  },

  // Review Management
  getAllReviews: async (params = {}) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },

  deleteReview: async (reviewId, reason = '') => {
    const response = await api.delete(`/admin/reviews/${reviewId}`, { data: { reason } });
    return response.data;
  },
};

const apiService = {
  auth: authService,
  user: userService,
  worker: workerService,
  booking: bookingService,
  review: reviewService,
  admin: adminService,
};

export default apiService;
