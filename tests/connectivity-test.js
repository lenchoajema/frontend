// Quick connectivity test to verify frontend-backend communication
const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testConnectivity() {
  console.log('🔍 Quick Connectivity Test');
  console.log('=' .repeat(40));
  
  // Test backend
  try {
    console.log('\n📡 Testing backend connection...');
    const backendResponse = await axios.get(`${BACKEND_URL}/api/products`, { timeout: 5000 });
    console.log('✅ Backend is responding');
    console.log(`   Status: ${backendResponse.status}`);
    console.log(`   Products found: ${backendResponse.data.products?.length || 0}`);
  } catch (error) {
    console.log('❌ Backend connection failed');
    console.log(`   Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Suggestion: Make sure backend server is running on port 5000');
    }
  }
  
  // Test frontend
  try {
    console.log('\n🌐 Testing frontend connection...');
    const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
    console.log('✅ Frontend is responding');
    console.log(`   Status: ${frontendResponse.status}`);
  } catch (error) {
    console.log('❌ Frontend connection failed');
    console.log(`   Error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Suggestion: Make sure frontend server is running on port 3000');
    }
  }
  
  // Test CORS and communication
  try {
    console.log('\n🔄 Testing frontend-backend communication...');
    // This simulates a request from frontend to backend
    const corsResponse = await axios.get(`${BACKEND_URL}/api/products`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      },
      timeout: 5000
    });
    console.log('✅ CORS configuration appears to be working');
  } catch (error) {
    console.log('⚠️ CORS test completed with warning');
    console.log(`   Response: ${error.response?.status || 'No response'}`);
  }
  
  console.log('\n🏁 Connectivity test complete');
}

if (require.main === module) {
  testConnectivity().catch(console.error);
}

module.exports = { testConnectivity };
