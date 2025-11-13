import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import Register from './pages/Register'
import WorkerRegister from './pages/WorkerRegister'
import WorkerSearch from './pages/WorkerSearch'
import WorkerProfile from './pages/WorkerProfile'
import WorkerProfileEdit from './pages/WorkerProfileEdit'
import Dashboard from './pages/Dashboard'
import WorkerDashboard from './pages/WorkerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import BookingPage from './pages/BookingPage'
import BookingConfirmation from './pages/BookingConfirmation'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import AISearchTest from './pages/AISearchTest'

function App() {
  console.log('🎯 App component rendering...');
  
  try {
    const { user } = useAuthStore();
    console.log('👤 User from store:', user);

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/worker" element={<WorkerRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/workers" element={<WorkerSearch />} />
            <Route path="/workers/:id" element={<WorkerProfile />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route 
              path="/worker/dashboard" 
              element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker/profile/edit" 
              element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerProfileEdit />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/bookings/new" element={<BookingPage />} />
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/bookings/:id" element={<BookingPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-search" element={<AISearchTest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('❌ Error in App component:', error);
    throw error;
  }
}

export default App
