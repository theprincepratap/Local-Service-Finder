import { useAuthStore } from '../store/authStore';

/**
 * Debug component to check auth state
 * Add this to any page: <AuthDebug />
 */
export default function AuthDebug() {
  const { user, token, isAuthenticated } = useAuthStore();
  
  const checkStorage = () => {
    console.log('=== AUTH DEBUG ===');
    console.log('Zustand State:', {
      user,
      token: token ? `${token.substring(0, 30)}...` : 'NULL',
      isAuthenticated,
      userRole: user?.role
    });
    console.log('localStorage token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('localStorage auth-storage:', localStorage.getItem('auth-storage'));
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'black',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🔐 AUTH DEBUG</div>
      <div>Token: {token ? '✅ EXISTS' : '❌ MISSING'}</div>
      <div>User: {user?.email || '❌ NONE'}</div>
      <div>Role: {user?.role || '❌ NONE'}</div>
      <div>Authenticated: {isAuthenticated ? '✅ YES' : '❌ NO'}</div>
      <button 
        onClick={checkStorage}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#4CAF50',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'white'
        }}
      >
        Check Console
      </button>
      <button 
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        style={{
          marginTop: '5px',
          marginLeft: '5px',
          padding: '5px 10px',
          background: '#f44336',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'white'
        }}
      >
        Clear & Reload
      </button>
    </div>
  );
}
