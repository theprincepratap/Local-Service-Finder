import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import WorkerRegister from './pages/WorkerRegister'
import WorkerSearch from './pages/WorkerSearch'
import WorkerProfile from './pages/WorkerProfile'
import Dashboard from './pages/Dashboard'
import WorkerDashboard from './pages/WorkerDashboard'
import BookingPage from './pages/BookingPage'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function App() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/worker" element={<WorkerRegister />} />
          <Route path="/workers" element={<WorkerSearch />} />
          <Route path="/workers/:id" element={<WorkerProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/bookings/:id" element={<BookingPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
