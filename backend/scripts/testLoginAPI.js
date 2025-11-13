// Test the admin login API endpoint directly
const http = require('http');

const loginData = JSON.stringify({
  email: 'admin@localworker.com',
  password: 'Admin@123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🔐 Testing Admin Login API...\n');
console.log('Request Details:');
console.log('─'.repeat(50));
console.log('URL: http://localhost:5000/api/auth/admin/login');
console.log('Method: POST');
console.log('Email: admin@localworker.com');
console.log('Password: Admin@123');
console.log('─'.repeat(50));
console.log('\nSending request...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', res.headers);
    console.log('\nResponse Body:');
    console.log('─'.repeat(50));
    
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch {
      console.log(data);
    }
    
    console.log('─'.repeat(50));
    
    if (res.statusCode === 200) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
    } else {
      console.log('\n❌ LOGIN FAILED!');
      console.log('Status Code:', res.statusCode);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  console.error('\n⚠️  Make sure the backend server is running!');
  console.error('Run: cd backend && npm run dev');
});

req.write(loginData);
req.end();
