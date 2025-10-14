#!/usr/bin/env node

/**
 * Seed Users Directly (for testing/development)
 * Adds users directly to the backend's in-memory user store
 */

const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function createSeedEndpoint() {
  console.log('🌱 Setting up seed users...');
  console.log('');
  
  // First, register three regular users
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123456',
      targetRole: 'admin',
    },
    {
      name: 'Seller User', 
      email: 'seller@example.com',
      password: 'seller123456',
      targetRole: 'seller',
    },
    {
      name: 'Customer User',
      email: 'customer@example.com',
      password: 'customer123456',
      targetRole: 'user',
    },
  ];

  for (const user of users) {
    try {
      // Register the user
      const registerData = JSON.stringify({
        name: user.name,
        email: user.email,
        password: user.password,
      });

      const registerOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(registerData),
        },
      };

      await new Promise((resolve, reject) => {
        const req = http.request(registerOptions, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 201) {
              console.log(`✅ Registered: ${user.email} (${user.targetRole})`);
            } else if (res.statusCode === 409) {
              console.log(`ℹ️  Already exists: ${user.email}`);
            } else {
              console.log(`⚠️  Status ${res.statusCode} for ${user.email}: ${body}`);
            }
            resolve();
          });
        });

        req.on('error', reject);
        req.write(registerData);
        req.end();
      });

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`❌ Error with ${user.email}:`, error.message);
    }
  }

  console.log('');
  console.log('✅ Seeding complete!');
  console.log('');
  console.log('📝 User Credentials (all registered as "user" role in degraded mode):');
  console.log('   Admin:    admin@example.com / admin123456');
  console.log('   Seller:   seller@example.com / seller123456');
  console.log('   Customer: customer@example.com / customer123456');
  console.log('');
  console.log('⚠️  Note: In degraded mode (no MongoDB), all users are created with "user" role.');
  console.log('   To use admin/seller roles, configure MongoDB and run the database seed script.');
}

if (require.main === module) {
  createSeedEndpoint().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { createSeedEndpoint };
