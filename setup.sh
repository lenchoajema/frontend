#!/bin/bash

echo "🚀 Starting E-commerce Application Setup..."

# Check if Docker containers are running
echo "📋 Checking Docker containers..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Setting up environment..."

# Start MongoDB and Redis if not running
if ! docker ps | grep -q ecommerce_mongodb; then
    echo "Starting MongoDB..."
    docker run -d --name ecommerce_mongodb \
        -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password123 \
        -e MONGO_INITDB_DATABASE=ecommerce \
        mongo:7.0
fi

if ! docker ps | grep -q ecommerce_redis; then
    echo "Starting Redis..."
    docker run -d --name ecommerce_redis \
        -p 6379:6379 \
        redis:7.2-alpine
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
cd /workspaces/frontend/backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Install frontend dependencies
cd /workspaces/frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "🧪 Testing connections..."
cd /workspaces/frontend/backend
node test-connection.js

echo ""
echo "🚀 Starting services..."

# Kill any existing processes
pkill -f "node server.js" 2>/dev/null || true
pkill -f "react-scripts start" 2>/dev/null || true

echo "Starting backend server..."
cd /workspaces/frontend/backend
nohup node server.js > backend.log 2>&1 &
sleep 3

echo "Backend log (last 10 lines):"
tail -10 backend.log

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev"
echo "   Backend:  https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev"
echo ""
echo "📊 To check backend status: tail -f /workspaces/frontend/backend/backend.log"
echo "📊 To check frontend: Open the frontend URL in your browser"
