import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/apiService';
import { toast } from 'react-hot-toast';
import { 
  FiLock, 
  FiMail, 
  FiEye, 
  FiEyeOff, 
  FiShield,
  FiAlertCircle 
} from 'react-icons/fi';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login: storeLogin, logout: storeLogout, user, isAuthenticated, setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_TIME = 300000; // 5 minutes in milliseconds

  // If already authenticated as admin, redirect to dashboard
  useEffect(() => {
    // Only redirect if authenticated AND not during a login attempt
    if (isAuthenticated && user && user.role === 'admin' && !loginAttempted) {
      console.log('Already authenticated as admin, redirecting to dashboard');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, loginAttempted]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if account is locked
    if (locked) {
      toast.error('Too many failed attempts. Please try again later.');
      return;
    }

    // Validate inputs
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoginAttempted(true);
    
    try {
      setLoading(true);

      // Login request using admin login endpoint
      const response = await authService.adminLogin(formData);
      
      console.log('Admin login response:', response);
      console.log('User role:', response.user.role);

      // Check if user is admin
      if (response.user.role !== 'admin' && response.user.role !== 'super-admin' && response.user.role !== 'moderator') {
        // Logout non-admin user immediately
        await storeLogout();
        
        // Show error without redirecting
        const remainingAttempts = MAX_ATTEMPTS - attempts - 1;
        if (remainingAttempts > 0) {
          toast.error(`Access denied. Admin privileges required. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
        }
        handleFailedAttempt();
        setLoginAttempted(false);
        return;
      }

      // Manually set auth state with admin response (don't call storeLogin which uses regular endpoint)
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Use setAuth to manually set the auth state
      setAuth(response.user, response.token);

      // Reset attempts on successful login
      setAttempts(0);
      setLocked(false);

      toast.success(`Welcome back, ${response.user.name}!`);
      
      console.log('Admin auth state set, token saved to localStorage');
      
      // Delay to ensure Zustand persist middleware completes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to admin dashboard
      setLoginAttempted(false);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      console.error('Admin login error:', error);
      
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      
      // Calculate remaining attempts
      const remainingAttempts = MAX_ATTEMPTS - attempts - 1;
      
      // Show error message with remaining attempts
      if (remainingAttempts > 0 && !locked) {
        toast.error(`${errorMessage}. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
      } else {
        toast.error(errorMessage);
      }
      
      handleFailedAttempt();
      setLoginAttempted(false);
      
      // Don't redirect - stay on login page
    } finally {
      setLoading(false);
    }
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      setLocked(true);
      toast.error(`Account locked for 5 minutes due to ${MAX_ATTEMPTS} failed login attempts`, {
        duration: 6000,
        icon: '🔒'
      });
      
      // Unlock after lockout time
      setTimeout(() => {
        setLocked(false);
        setAttempts(0);
        toast.success('Account unlocked. You may try again.', {
          icon: '🔓'
        });
      }, LOCKOUT_TIME);
    }
    // Note: The remaining attempts message is now shown in the main error toast
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Security Badge */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
            <FiShield className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Secure Administrator Portal
          </p>
          
          {/* Security Notice */}
          <div className="mt-4 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs text-red-300 font-medium">Restricted Access</p>
                <p className="text-xs text-gray-400 mt-1">
                  This area is for authorized administrators only. 
                  All login attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 shadow-2xl rounded-2xl border border-gray-700">
          <div className="px-8 py-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={locked}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={locked}
                    className="appearance-none block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={locked}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Attempts Warning */}
              {attempts > 0 && !locked && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-yellow-300">
                      {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts > 1 ? 's' : ''} remaining
                    </p>
                  </div>
                </div>
              )}

              {/* Locked Message */}
              {locked && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FiLock className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-red-300">Account Locked</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Too many failed attempts. Please wait 5 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading || locked}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/30"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : locked ? (
                    <>
                      <FiLock className="mr-2 h-5 w-5" />
                      Account Locked
                    </>
                  ) : (
                    <>
                      <FiShield className="mr-2 h-5 w-5" />
                      Sign in to Admin Panel
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-900 border-t border-gray-700 rounded-b-2xl">
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                ← Regular User Login
              </Link>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
            <div className="flex flex-col items-center">
              <FiShield className="w-5 h-5 mb-1 text-gray-600" />
              <span>Encrypted</span>
            </div>
            <div className="flex flex-col items-center">
              <FiLock className="w-5 h-5 mb-1 text-gray-600" />
              <span>Secured</span>
            </div>
            <div className="flex flex-col items-center">
              <FiAlertCircle className="w-5 h-5 mb-1 text-gray-600" />
              <span>Monitored</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Protected by advanced security measures
          </p>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
