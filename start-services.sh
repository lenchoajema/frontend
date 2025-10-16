#!/bin/bash

echo "=============================================="
echo "🚀 Starting Backend and Frontend Services"
echo "=============================================="
echo ""

# Check if we're in a dev container or need to install dependencies
echo "📦 Checking environment..."

# Check for Node.js and npm
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found. Installing Node.js and npm..."
    
    # Detect OS
    if [ -f /etc/alpine-release ]; then
        echo "Detected Alpine Linux"
        if command -v apk &> /dev/null; then
            echo "Installing via apk..."
            apk add --no-cache nodejs npm 2>/dev/null || {
                echo "⚠️  Permission denied. Trying with sudo..."
                sudo apk add --no-cache nodejs npm || {
                    echo "❌ Failed to install Node.js. Please run manually:"
                    echo "   sudo apk add --no-cache nodejs npm"
                    exit 1
                }
            }
        fi
    elif [ -f /etc/debian_version ]; then
        echo "Detected Debian/Ubuntu"
        sudo apt-get update && sudo apt-get install -y nodejs npm || {
            echo "❌ Failed to install Node.js"
            exit 1
        }
    else
        echo "❌ Unsupported OS. Please install Node.js manually."
        exit 1
    fi
    
    echo "✅ Node.js and npm installed successfully"
else
    echo "✅ Node.js $(node --version) found"
    echo "✅ npm $(npm --version) found"
fi

# Navigate to project root
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

echo ""
echo "📍 Project root: $PROJECT_ROOT"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install || {
        echo "❌ Failed to install dependencies"
        exit 1
    }
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if backend node_modules exists
if [ -d "backend" ] && [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install || {
        echo "❌ Failed to install backend dependencies"
        exit 1
    }
    cd "$PROJECT_ROOT"
    echo "✅ Backend dependencies installed"
fi

echo ""
echo "=============================================="
echo "🔧 Starting Services"
echo "=============================================="
echo ""

# Check for MongoDB and Redis
echo "🔍 Checking for MongoDB and Redis..."

# Check if MongoDB is running
if nc -z localhost 27017 2>/dev/null; then
    echo "✅ MongoDB is running on port 27017"
else
    echo "⚠️  MongoDB is not running on port 27017"
    echo "   Services may not work properly without MongoDB"
fi

# Check if Redis is running
if nc -z localhost 6379 2>/dev/null; then
    echo "✅ Redis is running on port 6379"
else
    echo "⚠️  Redis is not running on port 6379"
    echo "   Services may not work properly without Redis"
fi

echo ""
echo "=============================================="
echo "🎯 Starting Backend and Frontend"
echo "=============================================="
echo ""

# Check if concurrently is available
if ! npm list concurrently --depth=0 &> /dev/null; then
    echo "📦 Installing concurrently for parallel execution..."
    npm install --save-dev concurrently
fi

# Start both services using npm script
echo "🚀 Starting backend on port 5000 and frontend on port 3000..."
echo ""
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "In Codespaces:"
echo "  - Backend: https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev"
echo "  - Frontend: https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""
echo "=============================================="
echo ""

# Start services
npm run start:both

# If start:both fails, try alternative approach
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  start:both failed, trying alternative approach..."
    
    # Start backend in background
    echo "Starting backend..."
    npm run start:backend &
    BACKEND_PID=$!
    
    # Wait a bit for backend to start
    sleep 3
    
    # Start frontend in background
    echo "Starting frontend..."
    npm run start:frontend &
    FRONTEND_PID=$!
    
    # Wait for both processes
    wait $BACKEND_PID $FRONTEND_PID
fi
