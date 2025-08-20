import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 JWT Debug Information');
console.log('========================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('PORT:', process.env.PORT || 'Not set');

// Test JWT generation and verification
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
console.log('\n🔑 Using JWT_SECRET:', JWT_SECRET.substring(0, 20) + '...');

try {
  // Generate a test token
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    userType: 'patient',
    name: 'Test User'
  };

  console.log('\n🏭 Generating test token...');
  const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });
  console.log('✅ Token generated successfully');
  console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

  // Verify the token
  console.log('\n✅ Verifying test token...');
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('Decoded payload:', decoded);

  // Test with wrong secret
  console.log('\n❌ Testing with wrong secret...');
  try {
    jwt.verify(token, 'wrong-secret');
    console.log('❌ This should not work!');
  } catch (error) {
    console.log('✅ Correctly rejected with wrong secret:', error.message);
  }

} catch (error) {
  console.error('❌ JWT Error:', error.message);
}

console.log('\n🔍 Test completed');
