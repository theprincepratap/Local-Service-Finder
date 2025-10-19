// Emergency Simple App - Use this if main App has issues

import { BrowserRouter, Routes, Route } from 'react-router-dom'

const SimpleHome = () => (
  <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
    <h1 style={{ color: '#3B82F6', fontSize: '48px' }}>✅ LocalWorker App is Running!</h1>
    <div style={{ marginTop: '30px', padding: '20px', background: '#EFF6FF', borderRadius: '10px' }}>
      <h2>Status Check:</h2>
      <p>✅ React: Working</p>
      <p>✅ Vite Dev Server: Running</p>
      <p>✅ Routing: Working</p>
    </div>
    <div style={{ marginTop: '30px' }}>
      <h3>What to do next:</h3>
      <ol>
        <li>If you see this page, your app is working!</li>
        <li>The white screen was likely a temporary issue</li>
        <li>Try refreshing the page (Ctrl + R)</li>
        <li>If problem persists, check browser console (F12)</li>
      </ol>
    </div>
    <div style={{ marginTop: '30px' }}>
      <a href="/" style={{ padding: '12px 24px', background: '#3B82F6', color: 'white', textDecoration: 'none', borderRadius: '8px', marginRight: '10px' }}>
        Home
      </a>
      <a href="/login" style={{ padding: '12px 24px', background: '#10B981', color: 'white', textDecoration: 'none', borderRadius: '8px', marginRight: '10px' }}>
        Login
      </a>
      <a href="/register" style={{ padding: '12px 24px', background: '#F59E0B', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
        Register
      </a>
    </div>
  </div>
)

// To use this emergency app:
// In main.jsx, replace:
// import App from './App.jsx'
// with:
// import App from './App.emergency.jsx'

function EmergencyApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<SimpleHome />} />
      </Routes>
    </BrowserRouter>
  )
}

export default EmergencyApp
