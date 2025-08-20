import http from 'http';

const BASE_URL = 'http://localhost';
const PORT = process.env.PORT || 5000; // Updated to match your server.js change

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Token Flow');
  console.log('==============================');
  console.log(`🔗 Server: ${BASE_URL}:${PORT}`);

  try {
    // Step 1: Health check
    console.log('\n1️⃣ Health Check...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${healthResponse.statusCode}`);
    if (healthResponse.statusCode !== 200) {
      console.error('❌ Server is not responding correctly');
      return;
    }
    console.log('✅ Server is running');

    // Step 2: Patient Registration
    console.log('\n2️⃣ Patient Registration...');
    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Test Token User',
      email: 'token.test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '+1234567890'
    });
    
    console.log(`Status: ${registerResponse.statusCode}`);
    console.log('Response:', JSON.stringify(registerResponse.data, null, 2));

    if (!registerResponse.data.token) {
      console.error('❌ No token received from registration');
      return;
    }

    const token = registerResponse.data.token;
    console.log('✅ Token received:', token.substring(0, 50) + '...');

    // Step 3: Verify token with /api/auth/me
    console.log('\n3️⃣ Verify Token with /api/auth/me...');
    const meResponse = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Status: ${meResponse.statusCode}`);
    console.log('Response:', JSON.stringify(meResponse.data, null, 2));

    if (meResponse.statusCode !== 200) {
      console.error('❌ Token verification failed');
      return;
    }
    console.log('✅ Token verification successful');

    // Step 4: Update Profile
    console.log('\n4️⃣ Update Profile...');
    const updateResponse = await makeRequest({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Updated Token User',
      phone: '+1999999999'
    });
    
    console.log(`Status: ${updateResponse.statusCode}`);
    console.log('Response:', JSON.stringify(updateResponse.data, null, 2));

    if (updateResponse.statusCode === 200) {
      console.log('✅ Profile update successful!');
    } else {
      console.error('❌ Profile update failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCompleteFlow();
