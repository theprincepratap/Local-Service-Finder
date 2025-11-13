import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = '/login' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand persist to rehydrate from localStorage
  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('token');
    const authStorage = localStorage.getItem('auth-storage');
    
    console.log('🔄 [ProtectedRoute] Checking hydration:', {
      hasToken: !!token,
      hasAuthStorage: !!authStorage,
      isAuthenticated,
      user: user?.email
    });
    
    // Small delay to ensure Zustand persist has hydrated
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  // Show loading while waiting for hydration
  if (!isHydrated) {
    console.log('⏳ [ProtectedRoute] Waiting for Zustand hydration...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('✅ [ProtectedRoute] Hydration complete. Check:', { user, isAuthenticated, requiredRole });

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated) {
    console.log('❌ [ProtectedRoute] Not authenticated, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // Show loading if authenticated but user not loaded yet
  if (!user) {
    console.log('User not loaded yet, showing loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If role is required, check it
  if (requiredRole && user.role !== requiredRole) {
    console.log('User role mismatch. Expected:', requiredRole, 'Got:', user.role);
    return <Navigate to="/" replace />;
  }

  console.log('All checks passed, rendering protected content');
  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute;
