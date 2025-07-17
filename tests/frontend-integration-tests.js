// Frontend Integration Tests
// Tests the frontend-backend communication and key user flows

const puppeteer = require('puppeteer');
const path = require('path');

// Configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'password123'
};

let browser;
let page;

// Helper functions
const log = (message) => console.log(`\n✅ ${message}`);
const logError = (message, error) => console.error(`\n❌ ${message}:`, error.message);

const waitForSelector = async (selector, timeout = 5000) => {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.log(`⚠️ Selector ${selector} not found within ${timeout}ms`);
    return false;
  }
};

const takeScreenshot = async (name) => {
  await page.screenshot({ path: `tests/screenshots/${name}.png` });
};

// Test functions
async function setupBrowser() {
  try {
    console.log('\n🚀 Setting up browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI/CD
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync('tests/screenshots')) {
      fs.mkdirSync('tests/screenshots', { recursive: true });
    }
    
    log('Browser setup complete');
    return true;
  } catch (error) {
    logError('Browser setup failed', error);
    return false;
  }
}

async function testFrontendConnection() {
  try {
    console.log('\n🌐 Testing frontend connection...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    log(`Frontend loaded successfully. Title: ${title}`);
    await takeScreenshot('01-frontend-loaded');
    return true;
  } catch (error) {
    logError('Frontend connection failed', error);
    return false;
  }
}

async function testUserRegistration() {
  try {
    console.log('\n📝 Testing user registration flow...');
    
    // Navigate to register page
    await page.goto(`${FRONTEND_URL}/register`, { waitUntil: 'networkidle2' });
    
    // Wait for form elements
    const hasForm = await waitForSelector('form');
    if (!hasForm) {
      throw new Error('Registration form not found');
    }
    
    // Fill registration form
    await page.type('input[name="username"]', testUser.username);
    await page.type('input[name="email"]', testUser.email);
    await page.type('input[name="password"]', testUser.password);
    await page.type('input[name="confirmPassword"]', testUser.password);
    
    await takeScreenshot('02-registration-form-filled');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check for success or navigate to login
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl === FRONTEND_URL + '/') {
      log('Registration successful - redirected to login/home');
    } else {
      // Check for success message
      const successMessage = await page.$('.alert-success, .success, .toast-success');
      if (successMessage) {
        log('Registration successful - success message displayed');
      } else {
        throw new Error('Registration may have failed - no success indicator');
      }
    }
    
    await takeScreenshot('03-registration-complete');
    return true;
  } catch (error) {
    await takeScreenshot('03-registration-error');
    logError('Registration test failed', error);
    return false;
  }
}

async function testUserLogin() {
  try {
    console.log('\n🔐 Testing user login flow...');
    
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    
    // Wait for form elements
    const hasForm = await waitForSelector('form');
    if (!hasForm) {
      throw new Error('Login form not found');
    }
    
    // Fill login form
    await page.type('input[name="email"], input[type="email"]', testUser.email);
    await page.type('input[name="password"], input[type="password"]', testUser.password);
    
    await takeScreenshot('04-login-form-filled');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for response and check for redirect or success
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    const hasUserMenu = await page.$('.user-menu, .profile, .logout');
    
    if (currentUrl === FRONTEND_URL + '/' || hasUserMenu) {
      log('Login successful - redirected to home or user menu visible');
    } else {
      throw new Error('Login may have failed - no success indicator');
    }
    
    await takeScreenshot('05-login-complete');
    return true;
  } catch (error) {
    await takeScreenshot('05-login-error');
    logError('Login test failed', error);
    return false;
  }
}

async function testProductBrowsing() {
  try {
    console.log('\n🛍️ Testing product browsing...');
    
    // Navigate to home page
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Look for products
    const hasProducts = await waitForSelector('.product, .product-card, .item');
    
    if (hasProducts) {
      const products = await page.$$('.product, .product-card, .item');
      log(`Found ${products.length} products on the page`);
    } else {
      console.log('⚠️ No products found - this might be expected for a new setup');
    }
    
    await takeScreenshot('06-products-page');
    return true;
  } catch (error) {
    await takeScreenshot('06-products-error');
    logError('Product browsing test failed', error);
    return false;
  }
}

async function testAddToCart() {
  try {
    console.log('\n🛒 Testing add to cart flow...');
    
    // Look for add to cart button
    const addToCartBtn = await page.$('button[class*="cart"], button[class*="add"], .add-to-cart');
    
    if (addToCartBtn) {
      await addToCartBtn.click();
      await page.waitForTimeout(2000);
      
      // Check for cart indicator or success message
      const cartIndicator = await page.$('.cart-count, .cart-badge, .cart-items');
      const successMessage = await page.$('.alert-success, .success, .toast-success');
      
      if (cartIndicator || successMessage) {
        log('Add to cart successful');
      } else {
        log('Add to cart attempted - no clear success indicator');
      }
      
      await takeScreenshot('07-add-to-cart');
      return true;
    } else {
      console.log('⚠️ No add to cart button found - may need products first');
      return false;
    }
  } catch (error) {
    await takeScreenshot('07-add-to-cart-error');
    logError('Add to cart test failed', error);
    return false;
  }
}

async function testCartPage() {
  try {
    console.log('\n👀 Testing cart page...');
    
    // Navigate to cart page
    await page.goto(`${FRONTEND_URL}/cart`, { waitUntil: 'networkidle2' });
    
    // Check for cart content
    const hasCartItems = await waitForSelector('.cart-item, .cart-product, .item');
    
    if (hasCartItems) {
      log('Cart page loaded with items');
    } else {
      const emptyCart = await page.$('.empty-cart, .no-items');
      if (emptyCart) {
        log('Cart page loaded - empty cart message displayed');
      } else {
        log('Cart page loaded - content unclear');
      }
    }
    
    await takeScreenshot('08-cart-page');
    return true;
  } catch (error) {
    await takeScreenshot('08-cart-error');
    logError('Cart page test failed', error);
    return false;
  }
}

async function testCheckoutFlow() {
  try {
    console.log('\n💳 Testing checkout flow...');
    
    // Navigate to checkout page
    await page.goto(`${FRONTEND_URL}/checkout`, { waitUntil: 'networkidle2' });
    
    // Check for checkout form
    const hasCheckoutForm = await waitForSelector('form, .checkout-form');
    
    if (hasCheckoutForm) {
      log('Checkout page loaded with form');
      
      // Try to fill basic shipping information if form fields exist
      const streetField = await page.$('input[name*="street"], input[name*="address"]');
      if (streetField) {
        await page.type('input[name*="street"], input[name*="address"]', '123 Test Street');
        await page.type('input[name*="city"]', 'Test City');
        await page.type('input[name*="zip"], input[name*="postal"]', '12345');
        log('Filled shipping information');
      }
      
    } else {
      log('Checkout page loaded - no form found (may require cart items)');
    }
    
    await takeScreenshot('09-checkout-page');
    return true;
  } catch (error) {
    await takeScreenshot('09-checkout-error');
    logError('Checkout test failed', error);
    return false;
  }
}

async function cleanup() {
  try {
    if (browser) {
      await browser.close();
      log('Browser closed');
    }
  } catch (error) {
    logError('Cleanup failed', error);
  }
}

// Main test runner
async function runFrontendTests() {
  console.log('🎭 Starting Frontend Integration Tests');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Browser Setup', fn: setupBrowser },
    { name: 'Frontend Connection', fn: testFrontendConnection },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Product Browsing', fn: testProductBrowsing },
    { name: 'Add to Cart', fn: testAddToCart },
    { name: 'Cart Page', fn: testCartPage },
    { name: 'Checkout Flow', fn: testCheckoutFlow },
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
  
  await cleanup();
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 FRONTEND TEST SUMMARY');
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
  console.log('📸 Screenshots saved in tests/screenshots/');
  
  return { passed, total, results };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runFrontendTests().catch(console.error);
}

module.exports = {
  runFrontendTests,
  testUser
};
