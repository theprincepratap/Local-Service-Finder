import { Routes, Route } from 'react-router-dom'

// Simple test page
const TestPage = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial' }}>
    <h1>✅ React is Working!</h1>
    <p>If you see this, your React app is running correctly.</p>
    <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
      <h2>Debug Information:</h2>
      <p>✅ React Router: Working</p>
      <p>✅ Components: Rendering</p>
      <p>✅ Vite Dev Server: Running</p>
    </div>
    <div style={{ marginTop: '20px' }}>
      <a href="/" style={{ marginRight: '10px', padding: '10px 20px', background: '#3B82F6', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Home</a>
      <a href="/login" style={{ marginRight: '10px', padding: '10px 20px', background: '#3B82F6', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Login</a>
      <a href="/register" style={{ padding: '10px 20px', background: '#3B82F6', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Register</a>
    </div>
  </div>
)

function AppTest() {
  return (
    <div>
      <Routes>
        <Route path="*" element={<TestPage />} />
      </Routes>
    </div>
  )
}

export default AppTest
