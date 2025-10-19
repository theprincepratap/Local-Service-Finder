import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiBriefcase, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import WorkerRegistrationForm from '../components/WorkerRegistrationForm';
import LocationCapture from '../components/LocationCapture';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [registerType, setRegisterType] = useState(null); // null, 'user', 'worker'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    coordinates: null,
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Location validation for users (optional but recommended)
    if (!formData.coordinates) {
      toast.info('Consider adding your location for better service recommendations');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLocationCapture = (locationData) => {
    setFormData(prev => ({
      ...prev,
      coordinates: locationData.coordinates,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      
      // Set role based on registerType
      registrationData.role = registerType;
      
      // Add location data if captured
      if (registrationData.coordinates) {
        registrationData.location = {
          coordinates: registrationData.coordinates,
          address: '',
          city: '',
          state: '',
          pincode: ''
        };
      }
      
      console.log('User registration data:', registrationData); // Debug log
      
      await register(registrationData);
      toast.success(`Registration successful! Welcome ${registerType === 'worker' ? 'to our worker community' : 'aboard'}!`);
      
      // Redirect based on role
      const destination = registerType === 'worker' ? '/worker/dashboard' : '/dashboard';
      navigate(destination);
    } catch (error) {
      console.error('User registration error:', error); // Debug log
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      
      // Handle specific field errors from backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  // If no register type is selected, show the choice screen
  if (!registerType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-primary-600 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Join LocalWorker</h1>
            <p className="text-xl text-gray-600">Choose your account type to get started</p>
          </div>

          {/* Register Type Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* User Registration */}
            <button
              onClick={() => setRegisterType('user')}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-primary-500 transform hover:-translate-y-1"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <FiUser className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Register as User</h3>
                <p className="text-gray-600 mb-6">
                  Find and book local services with ease. Get instant access to verified workers.
                </p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Book services instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Track your bookings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Rate and review workers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Secure payments</span>
                  </li>
                </ul>
                <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                  Continue as User
                  <FiArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>

            {/* Worker Registration */}
            <button
              onClick={() => setRegisterType('worker')}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <FiBriefcase className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Register as Worker</h3>
                <p className="text-gray-600 mb-6">
                  Offer your services and grow your business. Connect with customers in your area.
                </p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Get job requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Manage your schedule</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Track your earnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Build your reputation</span>
                  </li>
                </ul>
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                  Continue as Worker
                  <FiArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>

          {/* Login Links */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Already have an account?</p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
              >
                Login as User
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
              >
                Login as Worker
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => setRegisterType(null)}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to account type selection
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-block p-3 rounded-full mb-4 ${
            registerType === 'worker' 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-primary-600'
          }`}>
            {registerType === 'worker' ? (
              <FiBriefcase className="w-8 h-8 text-white" />
            ) : (
              <FiUser className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {registerType === 'worker' ? 'Worker Registration' : 'User Registration'}
          </h2>
          <p className="text-gray-600">
            {registerType === 'worker' 
              ? 'Start offering your services today' 
              : 'Book services with ease'}
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          {registerType === 'worker' ? (
            <WorkerRegistrationForm />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Prince Kumar"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="theprincepratap@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="9876543210"
                  maxLength="10"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Location Capture */}
            <LocationCapture 
              onLocationCapture={handleLocationCapture}
              required={false}
              className="mt-4"
            />

            {/* Worker Registration Notice */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">💼</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">Registering as a Worker?</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Workers need to provide additional details like services, skills, availability, and documents.
                  </p>
                  <Link 
                    to="/register/worker"
                    className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Use Worker Registration Form →
                  </Link>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="text-sm text-gray-600">
              By registering, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                Privacy Policy
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                registerType === 'worker'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                  : 'btn-primary'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                `Create ${registerType === 'worker' ? 'Worker' : 'User'} Account`
              )}
            </button>
          </form>
          )}

          {/* Login Link - Only show for non-worker (worker form has its own) */}
          {registerType !== 'worker' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Sign in as User
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Terms & Privacy - Only for user registration (worker form has its own) */}
        {registerType !== 'worker' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
