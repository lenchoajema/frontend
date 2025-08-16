// Functional Tests for E-commerce Application
// Tests login, register, add to cart, and checkout functionality

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
// Backend expects name, email, password. Using username only caused failures.
const testUser = {
  name: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'Password123!'
};

let authToken = '';
let testProductId = '';
let orderId = '';

// Helper function for making authenticated requests
const makeAuthenticatedRequest = (url, method = 'GET', data = null) => {
  const config = {
    method,
    url: `${API_BASE}${url}`,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test utilities
const log = (message, data = '') => {
  console.log(`\n✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

const logError = (message, error) => {
  console.error(`\n❌ ${message}:`, error.response?.data || error.message);
};

// Test functions
async function testBackendConnection() {
  try {
    console.log('\n🔍 Testing backend connection...');
    const response = await axios.get(`${BASE_URL}/api/products`);
    log('Backend connection successful', { status: response.status });
    return true;
  } catch (error) {
    logError('Backend connection failed', error);
    return false;
  }
}

async function testUserRegistration() {
  try {
    console.log('\n📝 Testing user registration...');
    const response = await axios.post(`${API_BASE}/auth/register`, testUser);
    log('User registration successful', { 
      userId: response.data.user?.id,
      name: response.data.user?.name 
    });
    return true;
  } catch (error) {
    logError('User registration failed', error);
    return false;
  }
}

async function testUserLogin() {
  try {
    console.log('\n🔐 Testing user login...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = response.data.token;
    log('User login successful', { 
      token: authToken ? 'Token received' : 'No token',
      user: response.data.user?.name || response.data.user?.username 
    });
    return true;
  } catch (error) {
    logError('User login failed', error);
    return false;
  }
}

async function testGetProducts() {
  try {
    console.log('\n🛍️ Testing product retrieval...');
    const response = await axios.get(`${API_BASE}/products`);
    const list = Array.isArray(response.data) ? response.data : response.data.products || [];
    if (list.length > 0) {
      testProductId = list[0]._id;
      log('Products retrieved successfully', { count: list.length, firstProductId: testProductId });
      return true;
    }
    console.log('⚠️ No products found - this might be expected for a new setup');
    return false;
  } catch (error) {
    logError('Product retrieval failed', error);
    return false;
  }
}

async function testAddToCart() {
  if (!testProductId) {
    console.log('\n⚠️ Skipping add to cart test - no product available');
    return false;
  }
  
  try {
    console.log('\n🛒 Testing add to cart...');
    const response = await makeAuthenticatedRequest('/user/cart', 'POST', {
      productId: testProductId,
      quantity: 2
    });
    
    log('Add to cart successful', { 
      cartItems: response.data.cart?.items?.length || 0 
    });
    return true;
  } catch (error) {
    logError('Add to cart failed', error);
    return false;
  }
}

async function testViewCart() {
  try {
    console.log('\n👀 Testing view cart...');
    const response = await makeAuthenticatedRequest('/user/cart');
    
    log('View cart successful', { 
      items: response.data.items?.length || 0,
      total: response.data.total 
    });
    return true;
  } catch (error) {
    logError('View cart failed', error);
    return false;
  }
}

async function testCreateOrder() {
  try {
    console.log('\n📦 Testing order creation...');
    const response = await makeAuthenticatedRequest('/orders', 'POST', {
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'credit_card'
    });
    
    orderId = response.data.order?._id || response.data.orderId;
    log('Order creation successful', { 
      orderId,
      status: response.data.order?.status 
    });
    return true;
  } catch (error) {
    logError('Order creation failed', error);
    return false;
  }
}

async function testOrderHistory() {
  try {
    console.log('\n📋 Testing order history...');
    const response = await makeAuthenticatedRequest('/orders');
    
    log('Order history retrieval successful', { 
      orders: response.data.orders?.length || 0 
    });
    return true;
  } catch (error) {
    logError('Order history retrieval failed', error);
    return false;
  }
}

// Main test runner
async function runFunctionalTests() {
  console.log('🚀 Starting Functional Tests for E-commerce Application');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Backend Connection', fn: testBackendConnection },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Products', fn: testGetProducts },
    { name: 'Add to Cart', fn: testAddToCart },
    { name: 'View Cart', fn: testViewCart },
    { name: 'Create Order', fn: testCreateOrder },
    { name: 'Order History', fn: testOrderHistory },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      results.push({ name: test.name, passed: false, error: error.message });
    }
  }
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Frontend-Backend integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the logs above for details.');
  }
  
  return { passed, total, results };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runFunctionalTests().catch(console.error);
}

module.exports = {
  runFunctionalTests,
  testUser,
  API_BASE
};
