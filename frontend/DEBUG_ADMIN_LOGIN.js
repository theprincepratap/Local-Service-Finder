// Browser Console Test Script
// Run this in browser DevTools Console while on admin login page

console.log('🧪 ADMIN LOGIN DIAGNOSTIC TEST');
console.log('================================');

// Test 1: Check if apiService is available
console.log('\n1️⃣ Testing API Service...');
try {
  console.log('✅ apiService.authService.adminLogin exists:', typeof apiService.authService.adminLogin);
} catch (e) {
  console.log('❌ Error accessing apiService:', e.message);
}

// Test 2: Check localStorage
console.log('\n2️⃣ Checking localStorage...');
const token = localStorage.getItem('token');
console.log('Token in storage:', token ? `✅ Yes (${token.substring(0, 20)}...)` : '❌ No token');

// Test 3: Check auth store
console.log('\n3️⃣ Checking auth store...');
try {
  console.log('✅ Auth store loaded');
} catch (e) {
  console.log('❌ Auth store error:', e.message);
}

// Test 4: Manual login test
console.log('\n4️⃣ Manual Login Test...');
console.log('Running: apiService.authService.adminLogin({email: "admin@localworker.com", password: "Admin@123"})');

apiService.authService.adminLogin({
  email: 'admin@localworker.com',
  password: 'Admin@123'
})
.then(response => {
  console.log('✅ LOGIN SUCCESS');
  console.log('Response:', response);
  console.log('User:', response.user);
  console.log('Token:', response.token.substring(0, 30) + '...');
})
.catch(error => {
  console.log('❌ LOGIN FAILED');
  console.log('Error:', error);
  console.log('Response data:', error.response?.data);
  console.log('Status:', error.response?.status);
  console.log('Status text:', error.response?.statusText);
});

console.log('\n✋ Waiting for login response...');
