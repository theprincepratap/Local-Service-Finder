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
      console.log('Logging in with:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
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

  updateWorkerProfile: async (data) => {
    const response = await api.put('/workers/profile', data);
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
const apiService = {
  auth: authService,
  user: userService,
  worker: workerService,
  booking: bookingService,
  review: reviewService,
};

export default apiService;
