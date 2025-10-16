#!/usr/bin/env node

/**
 * Seed Users via API (works with in-memory or DB backend)
 * Creates admin, seller, and customer users by calling /auth/register endpoint
 */

const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123456',
    role: 'admin',
  },
  {
    name: 'Seller User',
    email: 'seller@example.com',
    password: 'seller123456',
    role: 'seller',
  },
  {
    name: 'Customer User',
    email: 'customer@example.com',
    password: 'customer123456',
    role: 'user', // Backend uses 'user' for customer role
  },
];

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function registerUser(userData) {
  try {
    const response = await makeRequest('POST', '/api/auth/register', userData);
    
    if (response.status === 201 || response.status === 200) {
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      return { success: true, user: response.data };
    } else if (response.status === 409) {
      console.log(`ℹ️  User already exists: ${userData.email} (${userData.role})`);
      return { success: true, exists: true };
    } else {
      console.error(`❌ Failed to create ${userData.email}: ${response.data.message || JSON.stringify(response.data)}`);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.error(`❌ Error creating ${userData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function seedUsers() {
  console.log('🌱 Seeding users via API...');
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log('');

  // Check if backend is available
  try {
    const health = await makeRequest('GET', '/health');
    if (health.status !== 200) {
      console.error('❌ Backend is not responding properly');
      process.exit(1);
    }
    console.log('✅ Backend is running');
    console.log('');
  } catch (error) {
    console.error('❌ Cannot connect to backend:', error.message);
    console.error('   Make sure the backend is running on', BACKEND_URL);
    process.exit(1);
  }

  let successCount = 0;
  let existsCount = 0;
  let failCount = 0;

  for (const user of SEED_USERS) {
    const result = await registerUser(user);
    if (result.success) {
      if (result.exists) {
        existsCount++;
      } else {
        successCount++;
      }
    } else {
      failCount++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${successCount}`);
  console.log(`   ℹ️  Already existed: ${existsCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('');

  if (failCount === 0) {
    console.log('✅ Seeding complete!');
    console.log('');
    console.log('📝 User Credentials:');
    console.log('   Admin:    admin@example.com / admin123456');
    console.log('   Seller:   seller@example.com / seller123456');
    console.log('   Customer: customer@example.com / customer123456');
  } else {
    console.log('⚠️  Seeding completed with errors');
  }
}

if (require.main === module) {
  seedUsers().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { seedUsers, SEED_USERS };
