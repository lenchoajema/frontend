#!/bin/bash

echo "🚀 Starting E-commerce Application..."

# Kill any existing node processes
pkill -f node

# Start backend server in background
echo "📡 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server..."
cd ..
npm start &
FRONTEND_PID=$!

echo "✅ Backend running on PID: $BACKEND_PID"
echo "✅ Frontend running on PID: $FRONTEND_PID"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: https://potential-guide-wv5pxxvwg45cgr75-3000.app.github.dev"
echo "   Backend:  https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev"
echo ""
echo "🔍 Health Check:"
echo "   Backend Health: https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/health"
echo "   API Health:     https://potential-guide-wv5pxxvwg45cgr75-5000.app.github.dev/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait
