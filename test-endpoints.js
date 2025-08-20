// Simple endpoint testing script using native Node.js
// Run with: node test-endpoints.js

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

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Health Check: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }
}

async function testGetDoctors() {
  console.log('\n🔍 Testing Get Doctors...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/doctors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Get Doctors: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Get Doctors failed:', error.message);
  }
}

async function testPatientRegistration() {
  console.log('\n🔍 Testing Patient Registration...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Test Patient',
      email: 'test.patient@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
      emergencyContact: '+1 (555) 987-6543'
    });
    
    console.log(`✅ Patient Registration: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('🎫 Token received for patient testing');
      return response.data.token;
    }
  } catch (error) {
    console.log('❌ Patient Registration failed:', error.message);
  }
  return null;
}

async function testPatientLogin() {
  console.log('\n🔍 Testing Patient Login...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'test.patient@example.com',
      password: 'password123',
      userType: 'patient'
    });
    
    console.log(`✅ Patient Login: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('🎫 Token received for patient testing');
      return response.data.token;
    }
  } catch (error) {
    console.log('❌ Patient Login failed:', error.message);
  }
  return null;
}

async function testDoctorLogin() {
  console.log('\n🔍 Testing Doctor Login...');
  try {
    const response = await makeRequest({
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
    
    console.log(`✅ Doctor Login: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('🎫 Token received for doctor testing');
      return response.data.token;
    }
  } catch (error) {
    console.log('❌ Doctor Login failed:', error.message);
  }
  return null;
}

async function testProtectedEndpoint(token, userType) {
  console.log(`\n🔍 Testing Protected Endpoint (${userType})...`);
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
    
    console.log(`✅ Protected Endpoint: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Protected Endpoint failed:', error.message);
  }
}

async function testJoinQueue(patientToken) {
  console.log('\n🔍 Testing Join Queue...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/queue/join',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      }
    }, {
      doctorId: 'DOC001',
      consultationType: 'General Consultation',
      symptoms: 'Fever and headache',
      urgencyLevel: 'Normal'
    });
    
    console.log(`✅ Join Queue: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Join Queue failed:', error.message);
  }
}

async function testDoctorDashboard(doctorToken) {
  console.log('\n🔍 Testing Doctor Dashboard...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/appointments/doctor/dashboard',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${doctorToken}`
      }
    });
    
    console.log(`✅ Doctor Dashboard: ${response.statusCode}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Doctor Dashboard failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...');
  console.log('=' * 50);
  
  // Test public endpoints
  await testHealthCheck();
  await testGetDoctors();
  
  // Test authentication
  let patientToken = await testPatientRegistration();
  if (!patientToken) {
    patientToken = await testPatientLogin();
  }
  const doctorToken = await testDoctorLogin();
  
  // Test protected endpoints
  if (patientToken) {
    await testProtectedEndpoint(patientToken, 'patient');
    await testJoinQueue(patientToken);
  }
  
  if (doctorToken) {
    await testProtectedEndpoint(doctorToken, 'doctor');
    await testDoctorDashboard(doctorToken);
  }
  
  console.log('\n🏁 Tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
