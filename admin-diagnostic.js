/**
 * Admin Login Diagnostic Tool
 * 
 * Paste this in browser console to diagnose login issues
 */

console.log('🔍 Admin Login Diagnostic Tool\n');
console.log('================================\n');

// Check 1: localStorage
console.log('1️⃣ Checking localStorage...');
const authStorage = localStorage.getItem('auth-storage');
const token = localStorage.getItem('token');

if (authStorage) {
  try {
    const parsed = JSON.parse(authStorage);
    console.log('✅ auth-storage found:', {
      hasUser: !!parsed.state?.user,
      hasToken: !!parsed.state?.token,
      isAuthenticated: parsed.state?.isAuthenticated,
      userRole: parsed.state?.user?.role,
      userName: parsed.state?.user?.name
    });
  } catch (e) {
    console.log('❌ auth-storage is corrupted:', e.message);
  }
} else {
  console.log('❌ No auth-storage found');
}

if (token) {
  console.log('✅ token found:', token.substring(0, 20) + '...');
} else {
  console.log('❌ No token found');
}

console.log('\n2️⃣ Checking Zustand store state...');
console.log('Note: Run this after importing useAuthStore');
console.log('Try: window.__authStore = useAuthStore.getState()');

console.log('\n3️⃣ Checking current URL...');
console.log('Current page:', window.location.href);
console.log('Current path:', window.location.pathname);

console.log('\n4️⃣ Testing backend connection...');
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Backend connection OK');
      console.log('✅ User authenticated:', data.data?.user?.email);
      console.log('✅ User role:', data.data?.user?.role);
    } else {
      console.log('❌ Backend returned error:', data.message);
    }
  })
  .catch(err => {
    console.log('❌ Backend connection failed:', err.message);
    console.log('   Make sure backend is running on http://localhost:5000');
  });

console.log('\n5️⃣ Quick Actions:');
console.log('Clear storage:     localStorage.clear()');
console.log('View auth state:   localStorage.getItem("auth-storage")');
console.log('View token:        localStorage.getItem("token")');
console.log('Test login API:    See ADMIN_FIX_APPLIED.md');

console.log('\n================================');
console.log('Diagnostic complete! Check results above.');
