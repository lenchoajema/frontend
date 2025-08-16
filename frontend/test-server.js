const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration for GitHub Codespaces
const corsOptions = {
  origin: [
    'https://potential-guide-wv5pxxvwg45cgr75.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3001.app.github.dev',
    'https://potential-guide-wv5pxxvwg45cgr75-3002.app.github.dev',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(express.json());
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS test successful!', origin: req.headers.origin });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register request received from:', req.headers.origin);
  res.json({ message: 'Registration endpoint working', data: req.body });
});

app.get('/api/products', (req, res) => {
  res.json({ message: 'Products endpoint working', products: [] });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ Test server running on http://${HOST}:${PORT}`);
  console.log(`✅ Server accessible at https://potential-guide-wv5pxxvwg45cgr75-${PORT}.app.github.dev`);
  console.log('✅ CORS configured for origins:', corsOptions.origin);
});
