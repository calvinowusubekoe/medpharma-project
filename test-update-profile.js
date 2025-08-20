// Test script for update profile endpoint
import http from 'http';

const BASE_URL = 'http://localhost:3001';

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

// Test patient profile update
async function testPatientProfileUpdate() {
  console.log('\n🧪 Testing Patient Profile Update...');
  
  try {
    // Step 1: Register/Login as patient
    console.log('📝 Step 1: Patient Registration...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Test Patient',
      email: 'profile.test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
      emergencyContact: '+1 (555) 987-6543'
    });
    
    console.log(`✅ Patient Registration: ${loginResponse.statusCode}`);
    
    if (!loginResponse.data.token) {
      console.log('❌ No token received, trying login instead...');
      
      const loginAttempt = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, {
        email: 'profile.test@example.com',
        password: 'password123',
        userType: 'patient'
      });
      
      if (loginAttempt.data.token) {
        loginResponse.data = loginAttempt.data;
        console.log(`✅ Patient Login: ${loginAttempt.statusCode}`);
      } else {
        console.log('❌ Failed to get token');
        return;
      }
    }
    
    const token = loginResponse.data.token;
    console.log('🎫 Token received:', token.substring(0, 20) + '...');
    
    // Step 2: Update profile
    console.log('\n📝 Step 2: Updating Patient Profile...');
    const updateResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Updated Patient Name',
      phone: '+1 (555) 999-8888',
      dateOfBirth: '1995-06-15',
      emergencyContact: '+1 (555) 111-2222'
    });
    
    console.log(`✅ Profile Update: ${updateResponse.statusCode}`);
    console.log('📊 Updated Profile:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Patient Profile Update failed:', error.message);
  }
}

// Test doctor profile update
async function testDoctorProfileUpdate() {
  console.log('\n🧪 Testing Doctor Profile Update...');
  
  try {
    // Step 1: Login as doctor
    console.log('📝 Step 1: Doctor Login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'dr.sarah@medpharma.com',
      doctorId: 'DOC001',
      password: 'doctor123',
      userType: 'doctor'
    });
    
    console.log(`✅ Doctor Login: ${loginResponse.statusCode}`);
    
    if (!loginResponse.data.token) {
      console.log('❌ No token received');
      console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('🎫 Token received:', token.substring(0, 20) + '...');
    
    // Step 2: Update profile
    console.log('\n📝 Step 2: Updating Doctor Profile...');
    const updateResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      availability: 'Running Late'
    });
    
    console.log(`✅ Profile Update: ${updateResponse.statusCode}`);
    console.log('📊 Updated Profile:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Doctor Profile Update failed:', error.message);
  }
}

// Test getting current user info
async function testGetCurrentUser(token, userType) {
  console.log(`\n🔍 Testing Get Current User (${userType})...`);
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Get Current User: ${response.statusCode}`);
    console.log('👤 User Info:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Get Current User failed:', error.message);
  }
}

// Run all tests
async function runProfileTests() {
  console.log('🚀 Starting Profile Update Tests...');
  console.log('=' * 50);
  
  await testPatientProfileUpdate();
  await testDoctorProfileUpdate();
  
  console.log('\n🏁 Profile Tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runProfileTests().catch(console.error);
}

export { runProfileTests };
